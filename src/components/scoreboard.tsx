"use client";

import { useState } from "react";
import { Noto_Sans_Mono } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

interface PlayerData {
  name: string;
  perks: string;
  traits: string;
  stats: string;
  health: string;
}

interface Stats {
  hours: number;
  kills: number;
  profession: string;
}
interface Health {
  health: number;
  infected: boolean;
}

const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"] });

export default function Scoreboard({
  server,
  playerData,
}: {
  server: string;
  playerData: PlayerData[];
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  if (!playerData || playerData.length < 3) return <div>Not enough data</div>;

  const data = playerData.map((player) => ({
    name: player.name,
    stats: JSON.parse(player.stats) as Stats,
    health: JSON.parse(player.health) as Health,
    perks: JSON.parse(player.perks),
    traits: JSON.parse(player.traits),
    rank: "",
  }));
  const formattedData = data
    .sort((a, b) => b.stats.kills - a.stats.kills)
    .slice(0, 30);
  for (let i = 0; i < formattedData.length; i++) {
    if (formattedData[i]) {
      formattedData[i].rank = (i + 1).toString();
    }
  }
  if (formattedData[0]) {
    formattedData[0].rank = "👑 " + formattedData[0].rank;
  }

  return (
    <>
      <Table className="border">
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="pr-0">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Kills</TableHead>
            <TableHead className="text-right">Time Survived</TableHead>
            <TableHead className="text-right">Health</TableHead>
            <TableHead className="text-right">Infected</TableHead>
            <TableHead className="text-right">Profession</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={`bg-slate-900 ${notoSansMono.className}`}>
          {formattedData.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="px-0 text-center">{row.rank}</TableCell>
              <TableCell>
                <button
                  className="text-blue-400 hover:underline focus:outline-none"
                  onClick={() => setSelectedPlayer(row)}
                  type="button"
                >
                  {row.name}
                </button>
              </TableCell>
              <TableCell className="text-right">{row.stats.kills}</TableCell>
              <TableCell className="text-right">
                {Math.floor(row.stats.hours)}
              </TableCell>
              <TableCell className="text-right">{row.health.health}</TableCell>
              <TableCell className="text-right">
                {row.health.infected ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">
                {row.stats.profession}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Sheet
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedPlayer?.name}</SheetTitle>
            <SheetDescription>Player Details</SheetDescription>
          </SheetHeader>
          {selectedPlayer && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="font-semibold">Stats</div>
                <ul className="ml-4 list-disc">
                  <li>Kills: {selectedPlayer.stats.kills}</li>
                  <li>Time Survived: {selectedPlayer.stats.hours} hours</li>
                  <li>Profession: {selectedPlayer.stats.profession}</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Health</div>
                <ul className="ml-4 list-disc">
                  <li>Health: {selectedPlayer.health.health}</li>
                  <li>
                    Infected: {selectedPlayer.health.infected ? "Yes" : "No"}
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Traits</div>
                <p className="ml-4">
                  {Array.isArray(selectedPlayer.traits)
                    ? selectedPlayer.traits.join(", ")
                    : ""}
                </p>
              </div>
              <div>
                <div className="font-semibold">Perks</div>
                <ul className="ml-4 list-none space-y-2">
                  {selectedPlayer.perks &&
                    Object.entries(selectedPlayer.perks).map(
                      ([perk, value]: [string, any]) => (
                        <li key={perk}>
                          <div className="mb-1 break-words capitalize">
                            {perk}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Progress
                                value={
                                  Math.max(0, Math.min(10, Number(value))) * 10
                                }
                              />
                            </div>
                            <span className="ml-2 w-6 text-right tabular-nums">
                              {value}
                            </span>
                          </div>
                        </li>
                      ),
                    )}
                </ul>
              </div>
            </div>
          )}
          <SheetClose asChild>
            <button className="mt-6 w-full rounded bg-slate-800 py-2 text-white hover:bg-slate-700">
              Close
            </button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </>
  );
}
