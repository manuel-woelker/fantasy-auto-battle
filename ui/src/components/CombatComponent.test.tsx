import { describe, expect, it, vi, afterEach } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { CombatComponent } from "./CombatComponent";
import {
  computeCombatResultWithRng,
  type Rng,
} from "../shared/combat/battle-computer";
import type { Card } from "../shared/models/card";
import type { Team } from "../shared/models/team";

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

function createCard(
  id: string,
  name: string,
  attack: number,
  defense: number,
): Card {
  return {
    id,
    name,
    attack,
    defense,
    types: ["test"],
    rarity: "common",
    keywords: [],
    behaviors: [],
  };
}

function createSingleLaneTeam(card: Card): Team {
  return {
    lanes: [[{ card }]],
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("CombatComponent", () => {
  it("renders battlefield lanes, slots and cards", () => {
    const teamA = createSingleLaneTeam(createCard("alpha", "Alpha", 5, 5));
    const teamB = createSingleLaneTeam(createCard("beta", "Beta", 1, 2));
    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      new SequenceRng([0]),
    );

    render(
      <CombatComponent
        teamA={teamA}
        teamB={teamB}
        result={result}
        autoPlay={false}
      />,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByTestId("step-label")).toHaveTextContent(
      `Step: 0 / ${result.events.length}`,
    );
  });

  it("advances combat events over time and updates board state", () => {
    vi.useFakeTimers();

    const teamA = createSingleLaneTeam(createCard("alpha", "Alpha", 5, 5));
    const teamB = createSingleLaneTeam(createCard("beta", "Beta", 1, 2));
    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      new SequenceRng([0]),
    );

    render(
      <CombatComponent teamA={teamA} teamB={teamB} result={result} speed={4} />,
    );

    const defenderSlot = screen.getByTestId("teamB-lane-0-slot-0");
    expect(within(defenderSlot).getByText("🛡 2")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(screen.getByTestId("step-label")).toHaveTextContent(
      `Step: 1 / ${result.events.length}`,
    );
    expect(within(defenderSlot).getByText("🛡 2")).toBeInTheDocument();
    expect(screen.getByTestId("damage-teamB-0-0")).toHaveTextContent(
      `${teamA.lanes[0][0].card?.attack}`,
    );
    expect(screen.getByTestId("damage-teamA-0-0")).toHaveTextContent(
      `${teamB.lanes[0][0].card?.attack}`,
    );

    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(screen.getByTestId("step-label")).toHaveTextContent(
      `Step: 2 / ${result.events.length}`,
    );
    expect(within(defenderSlot).getByText("🛡 0")).toBeInTheDocument();
    expect(screen.queryByTestId("damage-teamB-0-0")).not.toBeInTheDocument();
    expect(screen.queryByTestId("damage-teamA-0-0")).not.toBeInTheDocument();
  });

  it("uses the configured speed for playback interval", () => {
    vi.useFakeTimers();

    const teamA = createSingleLaneTeam(createCard("alpha", "Alpha", 5, 5));
    const teamB = createSingleLaneTeam(createCard("beta", "Beta", 1, 2));
    const result = computeCombatResultWithRng(
      teamA,
      teamB,
      new SequenceRng([0]),
    );

    render(
      <CombatComponent teamA={teamA} teamB={teamB} result={result} speed={1} />,
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("step-label")).toHaveTextContent(
      `Step: 0 / ${result.events.length}`,
    );

    act(() => {
      vi.advanceTimersByTime(550);
    });
    expect(screen.getByTestId("step-label")).toHaveTextContent(
      `Step: 1 / ${result.events.length}`,
    );
  });
});
