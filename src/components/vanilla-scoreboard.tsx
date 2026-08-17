import { Noto_Sans_Mono } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VanillaPlayer } from "@/lib/normalize";
import type { Result } from "@/lib/result";

const MAX_LEADERBOARD_ROWS = 30;

const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"] });

type Row = VanillaPlayer & { rank: string };

export default function VanillaScoreboard({
  result,
}: {
  result: Result<VanillaPlayer[]>;
}) {
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

  const players = result.data;
  if (players.length === 0) return <div>No players yet</div>;

  const data: Row[] = players
    .slice()
    .sort((a, b) => b.kills - a.kills)
    .slice(0, MAX_LEADERBOARD_ROWS)
    .map((player, i) => {
      const rankNumber = (i + 1).toString();
      return {
        ...player,
        rank: i === 0 ? `👑 ${rankNumber}` : rankNumber,
      };
    });

  return (
    <Table className="table-fixed border">
      <TableHeader>
        <TableRow className="hover:bg-inherit">
          <TableHead className="w-1/3 text-center">Rank</TableHead>
          <TableHead className="w-1/3 text-center">Name</TableHead>
          <TableHead className="w-1/3 text-center">Kills</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className={`bg-slate-900 ${notoSansMono.className}`}>
        {data.map((row) => (
          <TableRow key={row.username}>
            <TableCell className="text-center">{row.rank}</TableCell>
            <TableCell className="break-words text-center">
              {row.username}
            </TableCell>
            <TableCell className="text-center">{row.kills}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
