export const MAX_LEADERBOARD_ROWS = 50;

export interface PlayerData<T> {
  players: T[];
  onlinePlayers: T[] | null;
}

export type RankedRow<T> = T & { rank: string };

export function rankPlayers<T extends { username: string; kills: number }>(
  players: T[],
  limit?: number,
): RankedRow<T>[] {
  const sorted = players
    .slice()
    .sort((a, b) => b.kills - a.kills || a.username.localeCompare(b.username));
  const limited = limit === undefined ? sorted : sorted.slice(0, limit);
  return limited.map((player, index) => {
    const rankNumber = (index + 1).toString();
    return {
      ...player,
      rank: index === 0 ? `👑 ${rankNumber}` : rankNumber,
    };
  });
}
