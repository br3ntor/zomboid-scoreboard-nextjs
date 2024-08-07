"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";

import { useRouter } from "next/navigation";

export default function TabbedScoreboard({ server }: { server?: string }) {
  const defaultTab = server ? server : "medium";
  const router = useRouter();
  return (
    <Tabs
      defaultValue={defaultTab}
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
