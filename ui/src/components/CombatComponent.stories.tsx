import type { Meta, StoryObj } from "@storybook/react";
import { CombatComponent } from "./CombatComponent";
import { computeCombatResult } from "../shared/combat";
import type { Team } from "../shared/models/team";
import { CARDS } from "../shared/models/cards";

const teamA: Team = {
  lanes: [[{ card: CARDS[0] }, { card: CARDS[2] }], [{ card: CARDS[5] }]],
};

const teamB: Team = {
  lanes: [[{ card: CARDS[1] }, { card: CARDS[3] }], [{ card: CARDS[8] }]],
};

const result = computeCombatResult(teamA, teamB);

const meta: Meta<typeof CombatComponent> = {
  title: "Game/CombatComponent",
  component: CombatComponent,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    teamA,
    teamB,
    result,
    speed: 1,
    autoPlay: true,
  },
};

export default meta;
type Story = StoryObj<typeof CombatComponent>;

export const Default: Story = {};

export const SampleMatch: Story = {
  args: {
    teamA,
    teamB,
    result,
    speed: 1,
    autoPlay: true,
  },
};

export const SlowerPlayback: Story = {
  args: {
    speed: 0.5,
  },
};

export const FasterPlayback: Story = {
  args: {
    speed: 2.5,
  },
};
