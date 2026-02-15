import type { Card } from "./card";

export const CARDS: Card[] = [
  {
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
  },
  {
    id: "wolf",
    name: "Wolf",
    description: "A fierce predator that attacks with pack tactics.",
    attack: 3,
    defense: 2,
    types: ["beast", "creature"],
    rarity: "common",
    keywords: ["frenzy"],
    behaviors: [],
    set: "core",
  },
  {
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
  },
  {
    id: "archer",
    name: "Archer",
    description: "A ranged combatant that can hit enemies from afar.",
    attack: 4,
    defense: 2,
    types: ["human", "ranger"],
    rarity: "common",
    keywords: ["reach"],
    behaviors: [],
    set: "core",
  },
  {
    id: "dragon",
    name: "Dragon",
    description: "A mighty beast that breathes fire and takes to the skies.",
    attack: 8,
    defense: 8,
    types: ["dragon", "beast"],
    rarity: "legendary",
    keywords: ["flying", "lifesteal", "frenzy"],
    behaviors: [],
    set: "core",
  },
  {
    id: "priest",
    name: "Priest",
    description: "A holy healer that supports allies with divine magic.",
    attack: 2,
    defense: 4,
    types: ["human", "cleric"],
    rarity: "rare",
    keywords: ["heal"],
    behaviors: [
      {
        id: "priest-on-play",
        trigger: { type: "on_play" },
        effect: {
          type: "heal",
          params: { target: "allies", amount: 3 },
        },
      },
    ],
    set: "core",
  },
  {
    id: "assassin",
    name: "Assassin",
    description: "A deadly killer that strikes from the shadows.",
    attack: 6,
    defense: 2,
    types: ["human", "rogue"],
    rarity: "rare",
    keywords: ["stealth", "ambush", "poison"],
    behaviors: [],
    set: "core",
  },
  {
    id: "golem",
    name: "Golem",
    description: "An animated construct with formidable defenses.",
    attack: 4,
    defense: 10,
    types: ["construct", "elemental"],
    rarity: "rare",
    keywords: ["armor", "regenerate", "taunt"],
    behaviors: [
      {
        id: "golem-regenerate",
        trigger: { type: "on_turn_start" },
        effect: {
          type: "heal",
          params: { amount: 2 },
        },
        stackable: true,
        maxStacks: 5,
      },
    ],
    set: "core",
  },
  {
    id: "skeleton",
    name: "Skeleton",
    description: "An undead warrior that rises again when destroyed.",
    attack: 3,
    defense: 2,
    types: ["undead", "creature"],
    rarity: "uncommon",
    keywords: ["rebound", "decay"],
    behaviors: [],
    set: "core",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    description: "A legendary bird that rebirths from its ashes.",
    attack: 5,
    defense: 5,
    types: ["beast", "elemental"],
    rarity: "legendary",
    keywords: ["reborn", "flying", "burn", "regenerate"],
    behaviors: [
      {
        id: "phoenix-death",
        trigger: { type: "on_death" },
        effect: {
          type: "summon",
          params: { cardId: "phoenix-ash", stats: { attack: 3, defense: 3 } },
        },
      },
    ],
    set: "core",
  },
];

export const CARDS_BY_ID = Object.fromEntries(
  CARDS.map((card) => [card.id, card]),
) as Record<string, Card>;

export function getCardById(id: string): Card | undefined {
  return CARDS_BY_ID[id];
}

export function getCardsByType(type: string): Card[] {
  return CARDS.filter((card) => card.types.includes(type));
}

export function getCardsByRarity(rarity: string): Card[] {
  return CARDS.filter((card) => card.rarity === rarity);
}

export function getCardsByKeyword(keyword: string): Card[] {
  return CARDS.filter((card) => card.keywords.includes(keyword));
}

export function getCardsBySet(set: string): Card[] {
  return CARDS.filter((card) => card.set === set);
}
