import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getPlayerData } from "@/app/actions";

interface PlayerData {
  id: number;
  name: string;
  perks: string;
  traits: string;
  stats: string;
  health: string;
}

export default async function Scoreboard({ server }: { server: string }) {
  const pd = (await getPlayerData(server)) as PlayerData[];
  const data = pd.map((player) => ({
    id: player.id,
    name: player.name,
    perks: JSON.parse(player.perks),
    stats: JSON.parse(player.stats),
    health: JSON.parse(player.health),
  }));
  <Table className="border">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead className="text-right">Kills</TableHead>
        <TableHead className="text-right">Time Survived</TableHead>
        <TableHead className="text-right">Health</TableHead>
        <TableHead className="text-right">Infected</TableHead>
        <TableHead className="text-right">Profession</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody className="bg-slate-900">
      {data
        .slice()
        .sort((a, b) => b.stats.kills - a.stats.kills)
        .slice(0, 30)
        .map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell className="text-right">{row.stats.kills}</TableCell>
            <TableCell className="text-right">{row.stats.hours}</TableCell>
            <TableCell className="text-right">{row.health.health}</TableCell>
            <TableCell className="text-right">
              {row.health.infected ? "Yes" : "No"}
            </TableCell>
            <TableCell className="text-right">{row.stats.profession}</TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>;
}
