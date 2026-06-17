import type { B41Player, B42Player } from "./data";

export interface NormalizedPlayer {
  displayName: string;
  username: string;
  kills: number;
  hours: number;
  profession: string;
  health: number;
  infected: boolean;
  online: boolean | null;
  isDead: boolean | null;
  faction: string | null;
  gender: string | null;
  forename: string | null;
  surname: string | null;
  traits: string[];
  perks: Record<string, number>;
}

export function normalizeB41Player(player: B41Player): NormalizedPlayer {
  const stats = JSON.parse(player.stats) as {
    hours: number;
    kills: number;
    profession: string;
  };
  const health = JSON.parse(player.health) as {
    health: number;
    infected: boolean;
  };
  return {
    displayName: player.name,
    username: player.name,
    kills: stats.kills,
    hours: stats.hours,
    profession: stats.profession,
    health: health.health,
    infected: health.infected,
    online: null,
    isDead: null,
    faction: null,
    gender: null,
    forename: null,
    surname: null,
    traits: JSON.parse(player.traits) as string[],
    perks: JSON.parse(player.perks) as Record<string, number>,
  };
}

export function normalizeB42Player(player: B42Player): NormalizedPlayer {
  const forename = player.forename?.trim() ?? "";
  const surname = player.surname?.trim() ?? "";
  const displayName =
    forename && surname ? `${forename} ${surname}` : player.username;
  return {
    displayName,
    username: player.username,
    kills: player.zombie_kills,
    hours: player.hours_survived,
    profession: player.profession,
    health: player.health.overall_body_health,
    infected: player.health.is_infected,
    online: player.is_online,
    isDead: player.is_dead,
    faction: player.faction?.trim() ? player.faction : null,
    gender: player.gender,
    forename: player.forename?.trim() ? player.forename : null,
    surname: player.surname?.trim() ? player.surname : null,
    traits: player.traits,
    perks: player.perks,
  };
}
