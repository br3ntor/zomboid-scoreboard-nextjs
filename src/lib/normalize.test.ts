import { describe, it, expect } from "vitest";
import {
  normalizeB42ModdedPlayer,
  normalizeB42VanillaPlayer,
} from "./normalize";
import type { B42ModdedPlayer, B42VanillaPlayer } from "./data";

// b41-modded decommissioned; kept for reference.
// import { NormalizeError, normalizeB41Player } from "./normalize";
// import type { B41Player } from "./data";

// function makeB41(overrides: Partial<B41Player> = {}): B41Player {
//   return {
//     name: "alice",
//     perks: "{}",
//     traits: "[]",
//     stats: '{"hours":10,"kills":5,"profession":"Engineer"}',
//     health: '{"health":80,"infected":false}',
//     ...overrides,
//   };
// }

function makeB42(overrides: Partial<B42ModdedPlayer> = {}): B42ModdedPlayer {
  return {
    username: "bob42",
    online_id: "steam-1",
    is_online: true,
    is_dead: false,
    forename: "Bob",
    surname: "Smith",
    profession: "Firefighter",
    faction: "Survivors",
    gender: "Male",
    hours_survived: 100.5,
    zombie_kills: 42,
    health: {
      overall_body_health: 90,
      is_infected: false,
    },
    traits: ["Brave", "Lucky"],
    perks: { Fitness: 3, Strength: 5 },
    ...overrides,
  };
}

function makeB42Vanilla(
  overrides: Partial<B42VanillaPlayer> = {},
): B42VanillaPlayer {
  return {
    username: "vanilla_bob",
    score: 1500,
    playtime_seconds: 7200,
    ...overrides,
  };
}

// b41-modded decommissioned; kept for reference.
// describe("normalizeB41Player", () => {
//   it("parses a well-formed player", () => {
//     const result = normalizeB41Player(makeB41());
//     expect(result).toMatchObject({
//       displayName: "alice",
//       username: "alice",
//       kills: 5,
//       hours: 10,
//       profession: "Engineer",
//       health: 80,
//       infected: false,
//       isDead: null,
//       faction: null,
//       gender: null,
//       forename: null,
//       surname: null,
//       traits: [],
//       perks: {},
//     });
//   });

//   it("parses perks and traits JSON", () => {
//     const result = normalizeB41Player(
//       makeB41({
//         traits: '["Brave","Lucky"]',
//         perks: '{"Fitness":3,"Strength":5}',
//       }),
//     );
//     expect(result.traits).toEqual(["Brave", "Lucky"]);
//     expect(result.perks).toEqual({ Fitness: 3, Strength: 5 });
//   });

//   it("throws NormalizeError when stats JSON is malformed", () => {
//     expect(() => normalizeB41Player(makeB41({ stats: "not json" }))).toThrow(
//       NormalizeError,
//     );
//   });

//   it("throws NormalizeError when health JSON is malformed", () => {
//     expect(() => normalizeB41Player(makeB41({ health: "{" }))).toThrow(
//       NormalizeError,
//     );
//   });

//   it("throws NormalizeError when traits JSON is malformed", () => {
//     expect(() => normalizeB41Player(makeB41({ traits: "[broken" }))).toThrow(
//       NormalizeError,
//     );
//   });

//   it("NormalizeError preserves the underlying cause", () => {
//     try {
//       normalizeB41Player(makeB41({ stats: "oops" }));
//       throw new Error("expected to throw");
//     } catch (e) {
//       expect(e).toBeInstanceOf(NormalizeError);
//       expect((e as NormalizeError).cause).toBeDefined();
//       expect((e as NormalizeError).name).toBe("NormalizeError");
//     }
//   });
// });

describe("normalizeB42ModdedPlayer", () => {
  it("uses forename + surname as displayName when both are present", () => {
    const result = normalizeB42ModdedPlayer(makeB42());
    expect(result.displayName).toBe("Bob Smith");
  });

  it("falls back to username when forename is empty", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ forename: "" }));
    expect(result.displayName).toBe("bob42");
  });

  it("falls back to username when surname is empty", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ surname: "" }));
    expect(result.displayName).toBe("bob42");
  });

  it("treats whitespace-only forename as empty", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ forename: "   " }));
    expect(result.displayName).toBe("bob42");
    expect(result.forename).toBeNull();
  });

  it("preserves faction when it has content", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ faction: "Survivors" }));
    expect(result.faction).toBe("Survivors");
  });

  it("nulls out whitespace-only faction", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ faction: "   " }));
    expect(result.faction).toBeNull();
  });

  it("preserves gender as null when upstream provides null", () => {
    const result = normalizeB42ModdedPlayer(makeB42({ gender: null }));
    expect(result.gender).toBeNull();
  });

  it("maps health and kills fields from the upstream shape", () => {
    const result = normalizeB42ModdedPlayer(
      makeB42({
        zombie_kills: 99,
        hours_survived: 12.5,
        health: { overall_body_health: 50, is_infected: true },
      }),
    );
    expect(result.kills).toBe(99);
    expect(result.hours).toBe(12.5);
    expect(result.health).toBe(50);
    expect(result.infected).toBe(true);
  });
});

describe("normalizeB42VanillaPlayer", () => {
  it("maps score to kills and preserves username", () => {
    const result = normalizeB42VanillaPlayer(makeB42Vanilla());
    expect(result).toEqual({
      username: "vanilla_bob",
      kills: 1500,
    });
  });

  it("handles custom score and username", () => {
    const result = normalizeB42VanillaPlayer(
      makeB42Vanilla({ username: "custom_user", score: 9999 }),
    );
    expect(result.username).toBe("custom_user");
    expect(result.kills).toBe(9999);
  });
});
