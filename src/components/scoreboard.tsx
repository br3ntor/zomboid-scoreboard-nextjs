import { Noto_Sans_Mono } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getPlayerData } from "@/lib/data";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
});

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

// TODO: Add rank, truncate time survived
export default async function Scoreboard({ server }: { server: string }) {
  const pd = (await getPlayerData(server)) as PlayerData[];
  const data = pd.map((player) => ({
    // TODO: Write a function to validate the data.
    id: player.id,
    name: player.name,
    stats: JSON.parse(player.stats) as Stats,
    health: JSON.parse(player.health) as Health,
    rank: -1,
  }));
  const formattedData = data
    .sort((a, b) => b.stats.kills - a.stats.kills)
    .slice(0, 30);
  formattedData[0].name = formattedData[0].name.concat(" 👑");
  formattedData[2].name = formattedData[2].name.concat(" 🥛");
  if (server === "light") {
    formattedData[1].name = formattedData[1].name.concat(" 🥗");
  } else if (server === "medium") {
    formattedData[1].name = formattedData[1].name.concat(" 🥔");
  } else if (server === "heavy") {
    formattedData[1].name = formattedData[1].name.concat(" 🍖");
  }
  for (let i = 0; i <= formattedData.length; i++) {
    // There is an undefined entry in here being created from idk where yes
    // but I will figure it out eventually, for now we will just go around it.
    if (formattedData[i]) {
      formattedData[i].rank = i + 1;
    }
  }
  return (
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
            <TableCell className="text-center">{row.rank}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell className="text-right">{row.stats.kills}</TableCell>
            <TableCell className="text-right">
              {Math.floor(row.stats.hours)}
            </TableCell>
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
