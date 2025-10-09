import { createNewGame, joinGame, Move, play } from "@/lib/contract";
import { getStxBalance } from "@/lib/stx-utils";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";

const appDetails = {
  name: "Tic Tac Toe",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

// Explicitly target Testnet to align with contract/network config
const appConfig = new AppConfig(["store_write"], STACKS_TESTNET);
const userSession = new UserSession({ appConfig });

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stxBalance, setStxBalance] = useState(0);

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
  }

  async function handleCreateGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }
    if (betAmount === 0) {
      window.alert("Please make a bet");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await createNewGame(betAmount, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent create game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  async function handleJoinGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await joinGame(gameId, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent join game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  async function handlePlayGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await play(gameId, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          window.alert("Sent play game transaction");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        // Proactively clear corrupted session blobs before any SDK calls
        try {
          if (typeof window !== "undefined") {
            const maybeSession = window.localStorage.getItem("blockstack:session");
            if (maybeSession) {
              try {
                const parsed = JSON.parse(maybeSession);
                if (!parsed || typeof parsed.version !== "string") {
                  window.localStorage.removeItem("blockstack:session");
                }
              } catch {
                window.localStorage.removeItem("blockstack:session");
              }
            }
            const maybeStacksSession = window.localStorage.getItem("stacks-session");
            if (maybeStacksSession) {
              try {
                const parsed = JSON.parse(maybeStacksSession);
                if (!parsed || typeof parsed.version !== "string") {
                  window.localStorage.removeItem("stacks-session");
                }
              } catch {
                window.localStorage.removeItem("stacks-session");
              }
            }
          }
        } catch (_err) {
          console.warn("Session storage sanitize failed:", _err);
        }
        let isPending = false;
        try {
          isPending = userSession.isSignInPending();
        } catch (_err) {
          console.warn("isSignInPending threw, clearing session:", _err);
          userSession.signUserOut();
        }
        if (isPending) {
          const data = await userSession.handlePendingSignIn();
          setUserData(data);
          return;
        }
        let isSignedIn = false;
        try {
          isSignedIn = userSession.isUserSignedIn();
        } catch (_err) {
          console.warn("isUserSignedIn threw, clearing session:", _err);
          userSession.signUserOut();
          isSignedIn = false;
        }
        if (isSignedIn) {
          // Guard against corrupted/old session state
          try {
            const data = userSession.loadUserData();
            setUserData(data);
          } catch (_err) {
            console.warn("Invalid session data, signing out:", _err);
            userSession.signUserOut();
            setUserData(null);
          }
        }
      } catch (_err) {
        console.error("Wallet session init failed:", _err);
        setUserData(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (userData) {
      const address = userData.profile.stxAddress.testnet;
      getStxBalance(address).then((balance) => {
        setStxBalance(balance);
      });
    }
  }, [userData]);

  return {
    userData,
    stxBalance,
    connectWallet,
    disconnectWallet,
    handleCreateGame,
    handleJoinGame,
    handlePlayGame,
  };
}