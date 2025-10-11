import { GamesList } from "@/components/games-list";
import { getAllGames, getTotalGamesCreated } from "@/lib/contract";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getAllGames();
  // ADDED FUNCTIONALITY: Fetch total games created to display statistics
  const totalGamesCreated = await getTotalGamesCreated();

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Tic Tac Toe 🎲</h1>
        <span className="text-sm text-gray-500">
          Play 1v1 Tic Tac Toe on the Stacks blockchain
        </span>
        {/* ADDED FUNCTIONALITY: Display total games created as a statistic */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-lg font-semibold text-white">
            Total Games Created: <span className="text-blue-400">{totalGamesCreated}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This shows how many games have been created on the blockchain
          </p>
        </div>
      </div>

      <GamesList games={games} />
    </section>
  );
}