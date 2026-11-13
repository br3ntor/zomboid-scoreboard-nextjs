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
import type { Result } from "@/lib/result";
import {
  MAX_LEADERBOARD_ROWS,
  rankPlayers,
  type PlayerData,
  type RankedRow,
} from "@/lib/scoreboard";

const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"] });

type Row = RankedRow<NormalizedPlayer>;

export default function Scoreboard({
  result,
  onlineOnly,
}: {
  result: Result<PlayerData<NormalizedPlayer>>;
  onlineOnly: boolean;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<NormalizedPlayer | null>(
    null,
  );

  if (result.status === "error") {
    return (
      <div
        role="alert"
        className="rounded border border-red-500/50 bg-red-950/30 p-4 text-red-200"
      >
        <p className="font-semibold">Could not load scoreboard</p>
        <p className="mt-1 text-sm opacity-90">{result.error.message}</p>
      </div>
    );
  }

  const { players, onlinePlayers } = result.data;
  const showingOnline = onlineOnly && onlinePlayers !== null;
  const source = onlineOnly && onlinePlayers !== null ? onlinePlayers : players;

  if (source.length === 0) {
    return (
      <div>
        {showingOnline ? "No players online right now" : "No players yet"}
      </div>
    );
  }

  const data: Row[] = rankPlayers(
    source,
    showingOnline ? undefined : MAX_LEADERBOARD_ROWS,
  );

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
          {data.map((row) => (
            <TableRow key={row.username}>
              <TableCell className="px-0 text-center">{row.rank}</TableCell>
              <TableCell>
                <button
                  className="text-blue-400 hover:underline focus:outline-none"
                  onClick={() => setSelectedPlayer(row)}
                  type="button"
                >
                  {row.username}
                </button>
              </TableCell>
              <TableCell className="text-right">{row.kills}</TableCell>
              <TableCell className="text-right">
                {row.hours === null ? "—" : Math.floor(row.hours)}
              </TableCell>
              <TableCell className="text-right">
                {row.health === null ? "—" : Math.floor(row.health)}
              </TableCell>
              <TableCell className="text-right">
                {row.infected === null ? "—" : row.infected ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">
                {row.profession ?? "—"}
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
            <SheetTitle>{selectedPlayer?.username}</SheetTitle>
            <SheetDescription>Player Details</SheetDescription>
          </SheetHeader>
          {selectedPlayer && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="font-semibold">Stats</div>
                <ul className="ml-4 list-disc">
                  <li>Kills: {selectedPlayer.kills}</li>
                  <li>
                    Time Survived:{" "}
                    {selectedPlayer.hours === null
                      ? "—"
                      : `${Math.floor(selectedPlayer.hours)} hours`}
                  </li>
                  <li>Profession: {selectedPlayer.profession ?? "—"}</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Health</div>
                <ul className="ml-4 list-disc">
                  <li>
                    Health:{" "}
                    {selectedPlayer.health === null
                      ? "—"
                      : Math.floor(selectedPlayer.health)}
                  </li>
                  <li>
                    Infected:{" "}
                    {selectedPlayer.infected === null
                      ? "—"
                      : selectedPlayer.infected
                        ? "Yes"
                        : "No"}
                  </li>
                </ul>
              </div>
              {(selectedPlayer.isDead !== null ||
                selectedPlayer.faction !== null ||
                selectedPlayer.gender !== null ||
                selectedPlayer.forename !== null) && (
                <div>
                  <div className="font-semibold">Status</div>
                  <ul className="ml-4 list-disc">
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
                  {selectedPlayer.traits.length > 0
                    ? selectedPlayer.traits.join(", ")
                    : "—"}
                </p>
              </div>
              <div>
                <div className="font-semibold">Perks</div>
                {Object.keys(selectedPlayer.perks).length > 0 ? (
                  <ul className="ml-4 list-none space-y-2">
                    {Object.entries(selectedPlayer.perks).map(
                      ([perk, value]: [string, number]) => (
                        <li key={perk}>
                          <div className="mb-1 break-words capitalize">
                            {perk}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Progress
                                value={Math.max(0, Math.min(10, value)) * 10}
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
                ) : (
                  <p className="ml-4">—</p>
                )}
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
