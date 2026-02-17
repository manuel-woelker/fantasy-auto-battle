import type { Card } from "./card";
import { parseCardsMarkdown } from "./card-markdown.parser";

function getSetFromSourceFile(sourceFile: string): string {
  return sourceFile.replace(/^.*[\\/]/, "").replace(/\.md$/i, "");
}

/* 📖 # Why is card content loaded through import.meta.glob?
Using a markdown source-of-truth lets designers add or update cards without touching
TypeScript. We eagerly import all card definition files so the runtime card library
is deterministic and available synchronously to existing UI and test code.
*/
const cardMarkdownModules = import.meta.glob("../../../../cards/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

export const CARDS: Card[] = Object.entries(cardMarkdownModules).flatMap(
  ([sourcePath, markdown]) =>
    parseCardsMarkdown(markdown, sourcePath).map((card) => ({
      ...card,
      set: getSetFromSourceFile(sourcePath),
      types: [getSetFromSourceFile(sourcePath), ...card.types],
    })),
);

CARDS.sort((a, b) =>
  `${a.set ?? ""}/${a.name}`.localeCompare(`${b.set ?? ""}/${b.name}`),
);

const cardIds = new Set<string>();
for (const card of CARDS) {
  if (cardIds.has(card.id)) {
    throw new Error(
      `Duplicate card id "${card.id}" found across markdown files.`,
    );
  }
  cardIds.add(card.id);
}

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
