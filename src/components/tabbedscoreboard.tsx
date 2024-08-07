// "use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard2";
import { getPlayerData } from "@/lib/data";

import { useRouter } from "next/navigation";
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

export default function TabbedScoreboard({ server }: { server: string }) {
  // export default function TabbedScoreboard() {
  // const defaultTab = server ? server : "medium";
  const router = useRouter();
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
    <Tabs
      defaultValue={"medium"}
      onValueChange={(val) => {
        console.log(val);
        // router.push(val);
      }}
    >
      <TabsList>
        <TabsTrigger value="light">Light</TabsTrigger>
        <TabsTrigger value="medium">Medium</TabsTrigger>
        <TabsTrigger value="heavy">Heavy</TabsTrigger>
      </TabsList>
      <TabsContent value="light">
        <Scoreboard server="light" />
      </TabsContent>
      <TabsContent value="medium">
        <Scoreboard server="medium" />
      </TabsContent>
      <TabsContent value="heavy">
        <Scoreboard server="heavy" />
      </TabsContent>
    </Tabs>
  );
}
