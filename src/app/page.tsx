import { Button } from "@/components/ui/button";
import ScoreboardTabs from "@/components/scoreboard-tabs";
import Link from "next/link";
import Image from "next/image";
import { getB42ModdedPlayerData, getB42VanillaPlayerData } from "@/lib/data";
import {
  normalizeB42ModdedPlayer,
  normalizeB42VanillaPlayer,
} from "@/lib/normalize";
import { tryAsync } from "@/lib/result";

// b41-modded tab decommissioned; see git history to bring it back.
// import { getB41PlayerData } from "@/lib/data";
// import { normalizeB41Player } from "@/lib/normalize";

export default async function Home() {
  const [b42ModdedResult, b42VanillaResult] = await Promise.all([
    tryAsync(async () => {
      const data = await getB42ModdedPlayerData();
      return {
        players: data.players.map(normalizeB42ModdedPlayer),
        onlinePlayers:
          data.onlinePlayers?.map(normalizeB42ModdedPlayer) ?? null,
      };
    }),
    tryAsync(async () => {
      const data = await getB42VanillaPlayerData();
      return {
        players: data.players.map(normalizeB42VanillaPlayer),
        onlinePlayers:
          data.onlinePlayers?.map(normalizeB42VanillaPlayer) ?? null,
      };
    }),
  ]);
  return (
    <div className="mx-auto px-3 md:container lg:max-w-6xl">
      <header className="py-5 sm:flex sm:flex-row sm:justify-between">
        <h1 className="mb-3 text-4xl font-bold">
          West Coast Noobs Scoreboard 🧟‍♀️
        </h1>
        <Button asChild className="bg-sky-500 text-primary hover:bg-sky-600">
          <Link target="_blank" href="https://ko-fi.com/westcoastnoobs">
            <Image
              className="animate-wiggle"
              src={"/kofi-cup.png"}
              alt="ko-fi"
              width={28}
              height={28}
            />
            <span className="ml-1">Help with server cost!</span>
          </Link>
        </Button>
      </header>
      <main className="mb-4">
        <ScoreboardTabs vanilla={b42VanillaResult} modded={b42ModdedResult} />
      </main>
    </div>
  );
}
