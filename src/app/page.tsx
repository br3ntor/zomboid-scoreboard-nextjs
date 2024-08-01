import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";

export default async function Home() {
  return (
    <>
      <header className="my-5 sm:flex sm:flex-row sm:justify-between">
        <h1 className="text-4xl">West Coast Noobs Scoreboard 🧟‍♀️</h1>
        <Button className="bg-sky-500 text-primary hover:bg-sky-600">
          Help with server cost!
        </Button>
      </header>
      <main>
        <Tabs defaultValue="medium">
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
      </main>
    </>
  );
}
