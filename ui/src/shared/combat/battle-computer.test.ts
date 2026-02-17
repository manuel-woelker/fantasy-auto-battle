import { describe, expect, it } from "vitest";
import { CARDS } from "../models";
import type { Card } from "../models/card";
import type { Team } from "../models/team";
import {
  computeCombatResult,
  computeCombatResultWithRng,
  createDeterministicRng,
  describeCombatResult,
  type Rng,
} from "./battle-computer";

class SequenceRng implements Rng {
  private index = 0;

  constructor(private readonly values: number[]) {}

  next(): number {
    const current = this.values[this.index % this.values.length];
    this.index += 1;
    return current;
  }

  nextInt(maxExclusive: number): number {
    return Math.floor(this.next() * maxExclusive);
  }
}

function createSingleCardTeam(cardIndex: number): Team {
  return {
    lanes: [[{ card: CARDS[cardIndex] }]],
  };
}

function createTestCard(id: string, attack: number, defense: number): Card {
  return {
    id,
    name: id,
    attack,
    defense,
    types: ["test"],
    rarity: "common",
    keywords: [],
    behaviors: [],
  };
}

describe("computeCombatResult", () => {
  it("should be deterministic for equal inputs", () => {
    const teamA = createSingleCardTeam(0);
    const teamB = createSingleCardTeam(1);

    const first = computeCombatResult(teamA, teamB);
    const second = computeCombatResult(teamA, teamB);

    expect(first).toEqual(second);
  });

  it("should output chronological attack and faint events", () => {
    const teamA = createSingleCardTeam(4);
    const teamB = createSingleCardTeam(0);

    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      createDeterministicRng(1),
    );

    expect(result.winner).toBe("teamA");
    expect(result.events).toHaveLength(2);
    expect(result.events[0].type).toBe("attack");
    expect(result.events[1].type).toBe("faint");
  });

  it("should apply defender damage to attacker in the same attack", () => {
    const teamA = createSingleCardTeam(4);
    const teamB = createSingleCardTeam(0);

    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      new SequenceRng([0]),
    );
    const firstAttack = result.events[0];

    expect(firstAttack.type).toBe("attack");
    if (firstAttack.type === "attack") {
      expect(firstAttack.damageToTarget).toBe(CARDS[4].attack);
      expect(firstAttack.damageToAttacker).toBe(CARDS[0].attack);
      expect(firstAttack.attackerDefenseBefore).toBe(CARDS[4].defense);
      expect(firstAttack.attackerDefenseAfter).toBe(
        CARDS[4].defense - CARDS[0].attack,
      );
    }
  });

  it("should use injected RNG for deterministic target selection", () => {
    const teamA: Team = {
      lanes: [[{ card: CARDS[4] }]],
    };
    const teamB: Team = {
      lanes: [[{ card: CARDS[0] }, { card: CARDS[1] }]],
    };

    const rng = new SequenceRng([0.2, 0.8, 0.2]);
    const result = computeCombatResultWithRng(teamA, teamB, rng);
    const firstAttack = result.events.find((event) => event.type === "attack");

    expect(firstAttack).toBeDefined();
    if (firstAttack?.type === "attack") {
      expect(firstAttack.target.cardId).toBe(CARDS[0].id);
    }
  });

  it("should return draw when both teams are empty", () => {
    const result = computeCombatResult({ lanes: [] }, { lanes: [] });
    expect(result.winner).toBe("draw");
    expect(result.events).toHaveLength(0);
  });

  it("should not mutate input card values", () => {
    const teamA = createSingleCardTeam(4);
    const teamB = createSingleCardTeam(0);
    const originalDefense = teamB.lanes[0][0].card?.defense;

    computeCombatResult(teamA, teamB);

    expect(teamB.lanes[0][0].card?.defense).toBe(originalDefense);
  });

  it("should faint both units when they kill each other", () => {
    const teamA: Team = {
      lanes: [[{ card: createTestCard("test-a", 3, 3) }]],
    };
    const teamB: Team = {
      lanes: [[{ card: createTestCard("test-b", 3, 3) }]],
    };

    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      new SequenceRng([0]),
    );

    expect(result.winner).toBe("draw");
    expect(result.events[0].type).toBe("attack");
    expect(result.events[1]).toEqual({
      type: "faint",
      target: {
        team: "teamB",
        lane: 0,
        slot: 0,
        cardId: "test-b",
      },
    });
    expect(result.events[2]).toEqual({
      type: "faint",
      target: {
        team: "teamA",
        lane: 0,
        slot: 0,
        cardId: "test-a",
      },
    });
  });

  it("should match snapshot for a complete deterministic battle", () => {
    const teamA: Team = {
      lanes: [[{ card: CARDS[0] }, { card: CARDS[2] }], [{ card: CARDS[5] }]],
    };
    const teamB: Team = {
      lanes: [[{ card: CARDS[1] }, { card: CARDS[3] }], [{ card: CARDS[8] }]],
    };

    const result = computeCombatResult(teamA, teamB);
    expect(result).toMatchSnapshot();
  });

  it("should match snapshot for textual combat description", () => {
    const teamA: Team = {
      lanes: [[{ card: CARDS[0] }, { card: CARDS[2] }], [{ card: CARDS[5] }]],
    };
    const teamB: Team = {
      lanes: [[{ card: CARDS[1] }, { card: CARDS[3] }], [{ card: CARDS[8] }]],
    };

    const result = computeCombatResult(teamA, teamB);
    const description = describeCombatResult(result);
    expect(description).toMatchSnapshot();
  });
});
