import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";
import Link from "next/link";
import Image from "next/image";
import { getB41PlayerData, getB42PlayerData } from "@/lib/data";
import { normalizeB41Player, normalizeB42Player } from "@/lib/normalize";

export default async function Home({
  params,
}: {
  params: Promise<{ server?: string[] }>;
}) {
  const { server } = await params;
  const defaultTab = server ? server[0] : "b41-modded";
  const [b41Raw, b42Raw] = await Promise.all([
    getB41PlayerData(),
    getB42PlayerData(),
  ]);
  const b41Data = b41Raw.map(normalizeB41Player);
  const b42Data = b42Raw.map(normalizeB42Player);
  return (
    <div className="mx-auto px-3 md:container lg:max-w-6xl">
      <header className="py-5 sm:flex sm:flex-row sm:justify-between">
        <h1 className="mb-3 text-4xl font-bold">
          West Coast Noobs Scoreboard 🧟‍♀️
        </h1>
        <Button asChild className="bg-sky-500 text-primary hover:bg-sky-600">
          <Link target="_blank" href="https://ko-fi.com/westcoastnoobs">
            <Image
              className="animate-wiggle"
              src={"/kofi-cup.png"}
              alt="ko-fi"
              width={28}
              height={28}
            />
            <span className="ml-1">Help with server cost!</span>
          </Link>
        </Button>
      </header>
      <main className="mb-4">
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="b41-modded">b41-modded</TabsTrigger>
            <TabsTrigger value="b42-modded">b42-modded</TabsTrigger>
          </TabsList>
          <TabsContent value="b41-modded">
            <Scoreboard playerData={b41Data} />
          </TabsContent>
          <TabsContent value="b42-modded">
            <Scoreboard playerData={b42Data} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
