import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

// REPLACE THESE WITH YOUR OWN
const CONTRACT_ADDRESS = "ST3QGZ6VKAQVFT5YFXWMDQGSXK1NVAH8DJ8S7M5SG";
const CONTRACT_NAME = "stacks-tic-tac-toe";

type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
};

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];

// Use the exported STACKS_TESTNET network directly
const NETWORK = STACKS_TESTNET;

export async function getAllGames() {
    try {
      // Fetch the latest-game-id from the contract
      const latestGameIdCV = (await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-latest-game-id",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK,
      })) as UIntCV;

      // Convert the uintCV to a JS/TS number type
      const latestGameId = parseInt(latestGameIdCV.value.toString());

      // Loop from 0 to latestGameId-1 and fetch the game details for each game
      const games: Game[] = [];
      for (let i = 0; i < latestGameId; i++) {
        const game = await getGame(i);
        if (game) games.push(game);
      }
      return games;
    } catch (_err) {
      // Avoid crashing the server component; surface empty list instead
      console.error("getAllGames failed:", _err);
      return [] as Game[];
    }
  }
  
  // ADDED FUNCTIONALITY: Fetch total number of games created from the contract
  // This function calls the new get-total-games-created read-only function
  export async function getTotalGamesCreated() {
    try {
      const totalGamesCV = (await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-total-games-created",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK,
      })) as UIntCV;

      // Convert the uintCV to a JS/TS number type
      return parseInt(totalGamesCV.value.toString());
    } catch (_err) {
      console.error("getTotalGamesCreated failed:", _err);
      return 0; // Return 0 if the call fails
    }
  }
  
  export async function getGame(gameId: number) {
    try {
      // Use the get-game read only function to fetch the game details for the given gameId
      const gameDetails = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-game",
        functionArgs: [uintCV(gameId)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK,
      });

      const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;
      // If we get back a none, then the game does not exist and we return null
      if (responseCV.type === "none") return null;
      // If we get back a value that is not a tuple, something went wrong and we return null
      if (responseCV.value.type !== "tuple") return null;

      // If we got back a GameCV tuple, we can convert it to a Game object
      const gameCV = responseCV.value.value;

      const game: Game = {
        id: gameId,
        "player-one": gameCV["player-one"].value,
        "player-two":
          gameCV["player-two"].type === "some"
            ? gameCV["player-two"].value.value
            : null,
        "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
        "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
        board: gameCV["board"].value.map((cell) => parseInt(cell.value.toString())),
        winner:
          gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
      };
      return game;
    } catch (_err) {
      console.error(`getGame(${gameId}) failed:`, _err);
      return null;
    }
  }

  
export async function createNewGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "create-game",
      functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }
  
  export async function joinGame(gameId: number, moveIndex: number, move: Move) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "join-game",
      functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }
  
  export async function play(gameId: number, moveIndex: number, move: Move) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "play",
      functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }