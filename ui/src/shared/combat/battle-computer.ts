import type { Team } from "../models/team";

export interface Rng {
  next(): number;
  nextInt(maxExclusive: number): number;
}

export interface CombatantRef {
  team: "teamA" | "teamB";
  lane: number;
  slot: number;
  cardId: string;
}

export interface AttackCombatEvent {
  type: "attack";
  attacker: CombatantRef;
  target: CombatantRef;
  damageToTarget: number;
  damageToAttacker: number;
  attackerDefenseBefore: number;
  attackerDefenseAfter: number;
  targetDefenseBefore: number;
  targetDefenseAfter: number;
}

export interface FaintCombatEvent {
  type: "faint";
  target: CombatantRef;
}

export type CombatEvent = AttackCombatEvent | FaintCombatEvent;

export type CombatWinner = "teamA" | "teamB" | "draw";

export interface CombatResult {
  winner: CombatWinner;
  events: CombatEvent[];
}

interface UnitState {
  ref: CombatantRef;
  attack: number;
  defense: number;
  alive: boolean;
}

const DEFAULT_BATTLE_SEED = 0x0fab1e;
const MAX_TURNS = 10_000;

/* 📖 # Why is all random selection routed through an explicit RNG interface?
The battle simulation must be replayable and testable. Injecting RNG makes every
random choice explicit, and using a deterministic PRNG guarantees identical output
for identical inputs.
*/
export function computeCombatResult(teamA: Team, teamB: Team): CombatResult {
  const rng = createDeterministicRng(DEFAULT_BATTLE_SEED);
  return computeCombatResultWithRng(teamA, teamB, rng);
}

export function computeCombatResultWithRng(
  teamA: Team,
  teamB: Team,
  rng: Rng,
): CombatResult {
  const events: CombatEvent[] = [];
  const teamAUnits = collectUnits(teamA, "teamA");
  const teamBUnits = collectUnits(teamB, "teamB");

  let activeTeam: "teamA" | "teamB" = rng.nextInt(2) === 0 ? "teamA" : "teamB";
  let turn = 0;

  while (turn < MAX_TURNS) {
    const aliveA = teamAUnits.filter((u) => u.alive);
    const aliveB = teamBUnits.filter((u) => u.alive);

    if (aliveA.length === 0 || aliveB.length === 0) {
      return {
        winner: resolveWinner(aliveA.length, aliveB.length),
        events,
      };
    }

    const attackers = activeTeam === "teamA" ? aliveA : aliveB;
    const defenders = activeTeam === "teamA" ? aliveB : aliveA;
    const attacker = attackers[rng.nextInt(attackers.length)];
    const target = defenders[rng.nextInt(defenders.length)];

    const attackerDefenseBefore = attacker.defense;
    const targetDefenseBefore = target.defense;
    const damageToTarget = Math.max(0, attacker.attack);
    const damageToAttacker = Math.max(0, target.attack);
    attacker.defense = Math.max(0, attacker.defense - damageToAttacker);
    target.defense = Math.max(0, target.defense - damageToTarget);
    const attackerDefenseAfter = attacker.defense;
    const targetDefenseAfter = target.defense;

    events.push({
      type: "attack",
      attacker: attacker.ref,
      target: target.ref,
      damageToTarget,
      damageToAttacker,
      attackerDefenseBefore,
      attackerDefenseAfter,
      targetDefenseBefore,
      targetDefenseAfter,
    });

    if (target.defense <= 0) {
      target.alive = false;
      events.push({
        type: "faint",
        target: target.ref,
      });
    }

    if (attacker.defense <= 0) {
      attacker.alive = false;
      events.push({
        type: "faint",
        target: attacker.ref,
      });
    }

    activeTeam = activeTeam === "teamA" ? "teamB" : "teamA";
    turn += 1;
  }

  return {
    winner: "draw",
    events,
  };
}

export function createDeterministicRng(seed: number): Rng {
  let state = seed >>> 0;

  return {
    next(): number {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 0x100000000;
    },
    nextInt(maxExclusive: number): number {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error("maxExclusive must be a positive integer");
      }

      return Math.floor(this.next() * maxExclusive);
    },
  };
}

function collectUnits(team: Team, teamKey: "teamA" | "teamB"): UnitState[] {
  const units: UnitState[] = [];

  team.lanes.forEach((lane, laneIndex) => {
    lane.forEach((slot, slotIndex) => {
      if (!slot.card) {
        return;
      }

      units.push({
        ref: {
          team: teamKey,
          lane: laneIndex,
          slot: slotIndex,
          cardId: slot.card.id,
        },
        attack: slot.card.attack,
        defense: slot.card.defense,
        alive: slot.card.defense > 0,
      });
    });
  });

  return units;
}

function resolveWinner(aliveA: number, aliveB: number): CombatWinner {
  if (aliveA === 0 && aliveB === 0) {
    return "draw";
  }

  if (aliveA > 0) {
    return "teamA";
  }

  return "teamB";
}
