import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";
import Link from "next/link";
import Image from "next/image";

export default async function Home({
  params,
}: {
  params: { server?: string[] };
}) {
  const defaultTab = params.server ? params.server[0] : "medium";
  return (
    <>
      <header className="py-5 sm:flex sm:flex-row sm:justify-between">
        <h1 className="text-4xl font-bold">West Coast Noobs Scoreboard 🧟‍♀️</h1>
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
      <main className="">
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <Link href="/light">
              <TabsTrigger value="light">Light</TabsTrigger>
            </Link>
            <Link href="/medium">
              <TabsTrigger value="medium">Medium</TabsTrigger>
            </Link>
            <Link href="/heavy">
              <TabsTrigger value="heavy">Heavy</TabsTrigger>
            </Link>
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
