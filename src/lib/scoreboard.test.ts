import { describe, it, expect } from "vitest";
import { MAX_LEADERBOARD_ROWS, rankPlayers } from "./scoreboard";

const players = [
  { username: "b", kills: 10 },
  { username: "a", kills: 20 },
  { username: "c", kills: 10 },
];

describe("rankPlayers", () => {
  it("sorts by kills descending and ranks from 1", () => {
    expect(rankPlayers(players)).toEqual([
      { username: "a", kills: 20, rank: "👑 1" },
      { username: "b", kills: 10, rank: "2" },
      { username: "c", kills: 10, rank: "3" },
    ]);
  });

  it("uses username ascending as the tie-breaker", () => {
    const tied = [
      { username: "z", kills: 5 },
      { username: "a", kills: 5 },
    ];
    expect(rankPlayers(tied).map((player) => player.username)).toEqual([
      "a",
      "z",
    ]);
  });

  it("limits the rows when a limit is provided", () => {
    const many = Array.from({ length: MAX_LEADERBOARD_ROWS + 5 }, (_, i) => ({
      username: `player-${i}`,
      kills: i,
    }));
    const ranked = rankPlayers(many, MAX_LEADERBOARD_ROWS);
    expect(ranked).toHaveLength(MAX_LEADERBOARD_ROWS);
    expect(ranked[0].kills).toBe(MAX_LEADERBOARD_ROWS + 4);
  });

  it("ranks every row when no limit is provided", () => {
    const many = Array.from({ length: MAX_LEADERBOARD_ROWS + 5 }, (_, i) => ({
      username: `player-${i}`,
      kills: i,
    }));
    expect(rankPlayers(many)).toHaveLength(MAX_LEADERBOARD_ROWS + 5);
  });

  it("does not mutate the input array", () => {
    const input = [...players];
    rankPlayers(input);
    expect(input).toEqual(players);
  });

  it("returns an empty array for no players", () => {
    expect(rankPlayers([])).toEqual([]);
  });
});
