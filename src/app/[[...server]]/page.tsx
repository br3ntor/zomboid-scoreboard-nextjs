import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";
import Link from "next/link";
import Image from "next/image";
import { getPlayerData } from "@/lib/data";

export default async function Home({
  params,
}: {
  params: { server?: string[] };
}) {
  const defaultTab = params.server ? params.server[0] : "medium";
  const playerData = await getPlayerData();
  return (
    <div className="container mx-auto">
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
        <Scoreboard server="light" playerData={playerData} />
      </main>
    </div>
  );
}
