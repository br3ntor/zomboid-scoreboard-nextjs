import { env } from "./env";

export interface B41Player {
  name: string;
  perks: string;
  traits: string;
  stats: string;
  health: string;
}

export interface B42Player {
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

export interface B42Response {
  server: string;
  generated_at: string;
  snapshot_player_count: number;
  players: B42Player[];
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${res.status} ${res.statusText}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function getB41PlayerData(): Promise<B41Player[]> {
  return fetchJson<B41Player[]>(env.B41_API_URL);
}

export async function getB42PlayerData(): Promise<B42Player[]> {
  const data = await fetchJson<B42Response>(env.B42_API_URL);
  return data.players;
}
