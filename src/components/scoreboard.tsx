import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getPlayerData } from "@/lib/data";

interface PlayerData {
  id: number;
  name: string;
  perks: string;
  traits: string;
  stats: string;
  health: string;
}

// These two interfaces might be overkill but just wanted to for fun
interface Stats {
  hours: number;
  kills: number;
  profession: string;
}
interface Health {
  health: number;
  infected: boolean;
}

export default async function Scoreboard({ server }: { server: string }) {
  const pd = (await getPlayerData(server)) as PlayerData[];
  const data = pd.map((player) => ({
    // TODO: Write a function to validate the data.
    id: player.id,
    name: player.name,
    stats: JSON.parse(player.stats) as Stats,
    health: JSON.parse(player.health) as Health,
  }));
  const formattedData = data
    .sort((a, b) => b.stats.kills - a.stats.kills)
    .slice(0, 30);
  formattedData[0].name = formattedData[0].name.concat(" 👑");
  return (
    <Table className="border">
      <TableHeader>
        <TableRow className="hover:bg-inherit">
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Kills</TableHead>
          <TableHead className="text-right">Time Survived</TableHead>
          <TableHead className="text-right">Health</TableHead>
          <TableHead className="text-right">Infected</TableHead>
          <TableHead className="text-right">Profession</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-slate-900">
        {formattedData.map((row) => (
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
    </Table>
  );
}
