import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getOSInfo, getPlayerData } from "./actions";

interface PlayerData {
  id: number;
  name: string;
  perks: string;
  traits: string;
  stats: string;
  health: string;
}

export default async function Home() {
  const osInfo = await getOSInfo();
  const pd = (await getPlayerData("light")) as PlayerData[];
  const data = pd.map((player) => ({
    id: player.id,
    name: player.name,
    perks: JSON.parse(player.perks),
    stats: JSON.parse(player.stats),
    health: JSON.parse(player.health),
  }));
  console.log(osInfo);
  return (
    <>
      <header className="my-5 sm:flex sm:flex-row sm:justify-between">
        <h1 className="text-4xl">West Coast Noobs Scoreboard 🧟‍♀️</h1>
        <Button className="bg-sky-500 text-primary hover:bg-sky-600">
          Help with server cost!
        </Button>
      </header>
      <main className="">
        {/* <Table className="border"> */}
        {/*   <TableHeader> */}
        {/*     <TableRow> */}
        {/*       <TableHead>Name</TableHead> */}
        {/*       <TableHead className="text-right">Kills</TableHead> */}
        {/*       <TableHead className="text-right">Time Survived</TableHead> */}
        {/*       <TableHead className="text-right">Health</TableHead> */}
        {/*       <TableHead className="text-right">Infected</TableHead> */}
        {/*       <TableHead className="text-right">Profession</TableHead> */}
        {/*     </TableRow> */}
        {/*   </TableHeader> */}
        {/*   <TableBody className="bg-slate-900"> */}
        {/*     {data */}
        {/*       .slice() */}
        {/*       .sort((a, b) => b.stats.kills - a.stats.kills) */}
        {/*       .slice(0, 30) */}
        {/*       .map((row) => ( */}
        {/*         <TableRow key={row.name}> */}
        {/*           <TableCell>{row.name}</TableCell> */}
        {/*           <TableCell className="text-right"> */}
        {/*             {row.stats.kills} */}
        {/*           </TableCell> */}
        {/*           <TableCell className="text-right"> */}
        {/*             {row.stats.hours} */}
        {/*           </TableCell> */}
        {/*           <TableCell className="text-right"> */}
        {/*             {row.health.health} */}
        {/*           </TableCell> */}
        {/*           <TableCell className="text-right"> */}
        {/*             {row.health.infected ? "Yes" : "No"} */}
        {/*           </TableCell> */}
        {/*           <TableCell className="text-right"> */}
        {/*             {row.stats.profession} */}
        {/*           </TableCell> */}
        {/*         </TableRow> */}
        {/*       ))} */}
        {/*   </TableBody> */}
        {/* </Table> */}
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Light</TabsTrigger>
            <TabsTrigger value="password">Heavy</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
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
                      <TableCell className="text-right">
                        {row.stats.kills}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.stats.hours}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.health.health}
                      </TableCell>
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
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </main>
    </>
  );
}
