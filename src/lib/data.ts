import { env } from "./env";

// b41-modded decommissioned; see git history to bring it back.
// export interface B41Player {
//   name: string;
//   perks: string;
//   traits: string;
//   stats: string;
//   health: string;
// }

export interface B42ModdedPlayer {
  username: string;
  online_id: string;
  is_online: boolean;
  is_dead: boolean;
  forename: string;
  surname: string;
  profession: string;
  faction: string;
  gender: string | null;
  hours_survived: number;
  zombie_kills: number;
  health: {
    overall_body_health: number;
    is_infected: boolean;
  };
  traits: string[];
  perks: Record<string, number>;
}

export interface B42ModdedResponse {
  server: string;
  generated_at: string;
  snapshot_player_count: number;
  players: B42ModdedPlayer[];
}

export interface B42VanillaPlayer {
  username: string;
  score: number;
  playtime_seconds: number;
}

export interface B42VanillaResponse {
  server: string;
  generated_at: string;
  snapshot_player_count: number;
  players: B42VanillaPlayer[];
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// b41-modded decommissioned; kept for reference.
// export async function getB41PlayerData(): Promise<B41Player[]> {
//   return fetchJson<B41Player[]>(env.B41_API_URL);
// }

export async function getB42ModdedPlayerData(): Promise<B42ModdedPlayer[]> {
  const data = await fetchJson<B42ModdedResponse>(env.B42_MODDED_API_URL);
  return data.players;
}

export async function getB42VanillaPlayerData(): Promise<B42VanillaPlayer[]> {
  const data = await fetchJson<B42VanillaResponse>(env.B42_VANILLA_API_URL);
  return data.players;
}
