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
    rank: "",
  }));
  const formattedData = data
    .sort((a, b) => b.stats.kills - a.stats.kills)
    .slice(0, 30);

  // Add the ranks
  for (let i = 0; i <= formattedData.length; i++) {
    // There is an undefined entry in here being created from idk where yes
    // but I will figure it out eventually, for now we will just go around it.
    if (formattedData[i]) {
      formattedData[i].rank = (i + 1).toString();
    }
  }

  formattedData[0].rank = "👑 " + formattedData[0].rank;
  formattedData[2].rank = "🥛 " + formattedData[2].rank;

  const emoji = {
    light: "🥗 ",
    medium: "🥔 ",
    heavy: "🍖 ",
  };
  const validServer =
    server === "light" || server === "medium" || server === "heavy";
  const secondPlace = validServer ? emoji[server] : "🤡";
  formattedData[1].rank = secondPlace + formattedData[1].rank;

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
