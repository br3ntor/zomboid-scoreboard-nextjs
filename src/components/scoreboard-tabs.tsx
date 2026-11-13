"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Scoreboard from "@/components/scoreboard";
import VanillaScoreboard from "@/components/vanilla-scoreboard";
import type { NormalizedPlayer, VanillaPlayer } from "@/lib/normalize";
import type { Result } from "@/lib/result";
import type { PlayerData } from "@/lib/scoreboard";
import { cn } from "@/lib/utils";

const DEFAULT_TAB = "b42-vanilla";

export default function ScoreboardTabs({
  vanilla,
  modded,
}: {
  vanilla: Result<PlayerData<VanillaPlayer>>;
  modded: Result<PlayerData<NormalizedPlayer>>;
}) {
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [tab, setTab] = useState(DEFAULT_TAB);

  const active = tab === "b42-vanilla" ? vanilla : modded;
  const activeOnlinePlayers =
    active.status === "ok" ? active.data.onlinePlayers : null;
  const canToggle = activeOnlinePlayers !== null;
  const onlineCount = activeOnlinePlayers?.length ?? null;
  const onlineUnavailable =
    active.status === "ok" && active.data.onlinePlayers === null;

  function handleTabChange(value: string) {
    setTab(value);
    const next = value === "b42-vanilla" ? vanilla : modded;
    if (next.status !== "ok" || next.data.onlinePlayers === null) {
      setOnlineOnly(false);
    }
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <div className="flex flex-wrap items-center gap-2">
        <TabsList>
          <TabsTrigger value="b42-vanilla">b42-vanilla</TabsTrigger>
          <TabsTrigger value="b42-modded">b42-modded</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          {onlineUnavailable && (
            <span className="text-xs text-muted-foreground">
              Online status unavailable
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            aria-pressed={onlineOnly}
            disabled={!canToggle}
            title={!canToggle ? "Online status unavailable" : undefined}
            onClick={() => setOnlineOnly((value) => !value)}
            className={cn(
              onlineOnly &&
                canToggle &&
                "bg-sky-500 text-foreground hover:bg-sky-600",
            )}
          >
            <span
              className={cn(
                "mr-2 h-2 w-2 rounded-full",
                onlineOnly && canToggle ? "bg-emerald-400" : "bg-slate-500",
              )}
              aria-hidden="true"
            />
            Online only
            {onlineCount !== null && (
              <span className="ml-1 tabular-nums">({onlineCount})</span>
            )}
          </Button>
        </div>
      </div>
      <TabsContent value="b42-vanilla">
        <VanillaScoreboard result={vanilla} onlineOnly={onlineOnly} />
      </TabsContent>
      <TabsContent value="b42-modded">
        <Scoreboard result={modded} onlineOnly={onlineOnly} />
      </TabsContent>
    </Tabs>
  );
}
