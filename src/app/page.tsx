import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";
import VanillaScoreboard from "@/components/vanilla-scoreboard";
import Link from "next/link";
import Image from "next/image";
import {
  getB41PlayerData,
  getB42PlayerData,
  getB42VanillaPlayerData,
} from "@/lib/data";
import {
  normalizeB41Player,
  normalizeB42Player,
  normalizeB42VanillaPlayer,
} from "@/lib/normalize";
import { tryAsync } from "@/lib/result";

export default async function Home() {
  const [b41Result, b42Result, b42VanillaResult] = await Promise.all([
    tryAsync(async () => (await getB41PlayerData()).map(normalizeB41Player)),
    tryAsync(async () => (await getB42PlayerData()).map(normalizeB42Player)),
    tryAsync(async () =>
      (await getB42VanillaPlayerData()).map(normalizeB42VanillaPlayer),
    ),
  ]);
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
        <Tabs defaultValue="b42-modded">
          <TabsList>
            <TabsTrigger value="b41-modded">b41-modded</TabsTrigger>
            <TabsTrigger value="b42-modded">b42-modded</TabsTrigger>
            <TabsTrigger value="b42-vanilla">b42-vanilla</TabsTrigger>
          </TabsList>
          <TabsContent value="b41-modded">
            <Scoreboard result={b41Result} />
          </TabsContent>
          <TabsContent value="b42-modded">
            <Scoreboard result={b42Result} />
          </TabsContent>
          <TabsContent value="b42-vanilla">
            <VanillaScoreboard result={b42VanillaResult} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
