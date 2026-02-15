import type { Meta, StoryObj } from "@storybook/react";
import { CardComponent } from "./CardComponent";
import type { Card } from "../shared/models/card";

const meta: Meta<typeof CardComponent> = {
  title: "Game/CardComponent",
  component: CardComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CardComponent>;

const sampleCard: Card = {
  id: "goblin",
  name: "Goblin",
  description: "A small, mischievous creature that fights in groups.",
  attack: 2,
  defense: 1,
  types: ["goblin", "creature"],
  rarity: "common",
  keywords: ["swarm", "frenzy"],
  behaviors: [],
  set: "core",
};

const knightCard: Card = {
  id: "knight",
  name: "Knight",
  description: "A heavily armored warrior that protects allies.",
  attack: 3,
  defense: 5,
  types: ["human", "soldier"],
  rarity: "common",
  keywords: ["taunt", "guard"],
  behaviors: [],
  set: "core",
};

const noDescriptionCard: Card = {
  id: "mystery",
  name: "Mysterious Entity",
  attack: 5,
  defense: 5,
  types: ["unknown"],
  rarity: "legendary",
  keywords: [],
  behaviors: [],
};

export const Default: Story = {
  args: {
    card: sampleCard,
  },
};

export const HighDefense: Story = {
  args: {
    card: knightCard,
  },
};

export const NoDescription: Story = {
  args: {
    card: noDescriptionCard,
  },
};
