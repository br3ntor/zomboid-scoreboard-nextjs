const B41_API_URL =
  process.env.B41_API_URL ?? "https://wcn.westcoastnoobs.com/players";
const B42_API_URL =
  process.env.B42_API_URL ?? "http://127.0.0.1:8080/api/leaderboard/kills";

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
    apparent_level: number;
    is_fake: boolean;
    is_infected: boolean;
    overall_body_health: number;
  };
  traits: string[];
  perks: Record<string, number>;
}

interface B42Response {
  server: string;
  generated_at: string;
  snapshot_player_count: number;
  players: B42Player[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }

  console.log("----------------------------");
  console.log(res.headers.get("date"));
  console.log(`Data fetched from ${url}`);

  return res.json();
}

export async function getB41PlayerData(): Promise<B41Player[]> {
  return fetchJson<B41Player[]>(B41_API_URL);
}

export async function getB42PlayerData(): Promise<B42Player[]> {
  const data = await fetchJson<B42Response>(B42_API_URL);
  return data.players;
}
