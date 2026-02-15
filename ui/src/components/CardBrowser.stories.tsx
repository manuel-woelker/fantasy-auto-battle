import type { Meta, StoryObj } from "@storybook/react";
import { CardBrowser } from "./CardBrowser";
import { CARDS } from "../shared/models/cards";
import type { Card } from "../shared/models/card";

const meta: Meta<typeof CardBrowser> = {
  title: "Game/CardBrowser",
  component: CardBrowser,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CardBrowser>;

const legendaryCards: Card[] = CARDS.filter((c) => c.rarity === "legendary");
const humanCards: Card[] = CARDS.filter((c) => c.types.includes("human"));

export const Default: Story = {
  args: {},
};

export const LegendaryOnly: Story = {
  args: {
    cards: legendaryCards,
  },
};

export const HumanOnly: Story = {
  args: {
    cards: humanCards,
  },
};
