import type { B42ModdedPlayer, B42VanillaPlayer } from "./data";

export interface VanillaPlayer {
  username: string;
  kills: number;
}

export interface NormalizedPlayer {
  displayName: string;
  username: string;
  kills: number;
  hours: number | null;
  profession: string | null;
  health: number | null;
  infected: boolean | null;
  isDead: boolean | null;
  faction: string | null;
  gender: string | null;
  forename: string | null;
  surname: string | null;
  traits: string[];
  perks: Record<string, number>;
}

// b41-modded decommissioned; kept for reference.
// export class NormalizeError extends Error {
//   constructor(
//     message: string,
//     public readonly cause?: unknown,
//   ) {
//     super(message);
//     this.name = "NormalizeError";
//   }
// }

// function safeJsonParse<T>(raw: string, context: string): T {
//   try {
//     return JSON.parse(raw) as T;
//   } catch (e) {
//     throw new NormalizeError(
//       `Failed to parse ${context} as JSON: ${(e as Error).message}`,
//       e,
//     );
//   }
// }

// interface B41Stats {
//   hours: number;
//   kills: number;
//   profession: string;
// }

// interface B41Health {
//   health: number;
//   infected: boolean;
// }

// export function normalizeB41Player(player: B41Player): NormalizedPlayer {
//   const stats = safeJsonParse<B41Stats>(player.stats, "stats");
//   const health = safeJsonParse<B41Health>(player.health, "health");
//   return {
//     displayName: player.name,
//     username: player.name,
//     kills: stats.kills,
//     hours: stats.hours,
//     profession: stats.profession,
//     health: health.health,
//     infected: health.infected,
//     isDead: null,
//     faction: null,
//     gender: null,
//     forename: null,
//     surname: null,
//     traits: safeJsonParse<string[]>(player.traits, "traits"),
//     perks: safeJsonParse<Record<string, number>>(player.perks, "perks"),
//   };
// }

export function normalizeB42ModdedPlayer(
  player: B42ModdedPlayer,
): NormalizedPlayer {
  const forename = player.forename?.trim() ?? "";
  const surname = player.surname?.trim() ?? "";
  const profession = player.profession?.trim() ?? "";
  const faction = player.faction?.trim() ?? "";
  const gender = player.gender?.trim() ?? "";
  const displayName =
    forename && surname ? `${forename} ${surname}` : player.username;
  return {
    displayName,
    username: player.username,
    kills: player.zombie_kills,
    hours: player.hours_survived ?? null,
    profession: profession || null,
    health: player.health?.overall_body_health ?? null,
    infected: player.health?.is_infected ?? null,
    isDead: player.is_dead ?? null,
    faction: faction || null,
    gender: gender || null,
    forename: forename || null,
    surname: surname || null,
    traits: Array.isArray(player.traits) ? player.traits : [],
    perks: player.perks ?? {},
  };
}

export function normalizeB42VanillaPlayer(
  player: B42VanillaPlayer,
): VanillaPlayer {
  return {
    username: player.username,
    kills: player.score,
  };
}
