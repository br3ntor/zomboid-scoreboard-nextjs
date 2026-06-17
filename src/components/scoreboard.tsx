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
import type { NormalizedPlayer } from "@/lib/normalize";

const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"] });

type Row = NormalizedPlayer & { rank: string };

export default function Scoreboard({
  playerData,
}: {
  playerData: NormalizedPlayer[];
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<NormalizedPlayer | null>(
    null,
  );

  if (!playerData || playerData.length === 0)
    return <div>No players yet</div>;

  const data: Row[] = playerData
    .slice()
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 30)
    .map((player, i) => ({ ...player, rank: (i + 1).toString() }));

  if (data[0]) {
    data[0].rank = "👑 " + data[0].rank;
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
            <TableHead className="text-right">Online</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Profession</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={`bg-slate-900 ${notoSansMono.className}`}>
          {data.map((row) => (
            <TableRow key={row.username}>
              <TableCell className="px-0 text-center">{row.rank}</TableCell>
              <TableCell>
                <button
                  className="text-blue-400 hover:underline focus:outline-none"
                  onClick={() => setSelectedPlayer(row)}
                  type="button"
                >
                  {row.displayName}
                </button>
              </TableCell>
              <TableCell className="text-right">{row.kills}</TableCell>
              <TableCell className="text-right">
                {Math.floor(row.hours)}
              </TableCell>
              <TableCell className="text-right">{row.health}</TableCell>
              <TableCell className="text-right">
                {row.infected ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">
                {row.online === null ? "—" : row.online ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">
                {row.isDead === null
                  ? "—"
                  : row.isDead
                    ? "Dead"
                    : "Alive"}
              </TableCell>
              <TableCell className="text-right">{row.profession}</TableCell>
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
            <SheetTitle>{selectedPlayer?.displayName}</SheetTitle>
            <SheetDescription>Player Details</SheetDescription>
          </SheetHeader>
          {selectedPlayer && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="font-semibold">Stats</div>
                <ul className="ml-4 list-disc">
                  <li>Kills: {selectedPlayer.kills}</li>
                  <li>Time Survived: {selectedPlayer.hours} hours</li>
                  <li>Profession: {selectedPlayer.profession}</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Health</div>
                <ul className="ml-4 list-disc">
                  <li>Health: {selectedPlayer.health}</li>
                  <li>
                    Infected: {selectedPlayer.infected ? "Yes" : "No"}
                  </li>
                </ul>
              </div>
              {(selectedPlayer.online !== null ||
                selectedPlayer.isDead !== null ||
                selectedPlayer.faction !== null ||
                selectedPlayer.gender !== null ||
                selectedPlayer.forename !== null) && (
                <div>
                  <div className="font-semibold">Status</div>
                  <ul className="ml-4 list-disc">
                    {selectedPlayer.online !== null && (
                      <li>Online: {selectedPlayer.online ? "Yes" : "No"}</li>
                    )}
                    {selectedPlayer.isDead !== null && (
                      <li>
                        Status: {selectedPlayer.isDead ? "Dead" : "Alive"}
                      </li>
                    )}
                    {selectedPlayer.faction !== null && (
                      <li>Faction: {selectedPlayer.faction}</li>
                    )}
                    {selectedPlayer.gender !== null && (
                      <li>Gender: {selectedPlayer.gender}</li>
                    )}
                    {selectedPlayer.forename !== null &&
                      selectedPlayer.surname !== null && (
                        <li>
                          Character: {selectedPlayer.forename}{" "}
                          {selectedPlayer.surname}
                        </li>
                      )}
                  </ul>
                </div>
              )}
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
