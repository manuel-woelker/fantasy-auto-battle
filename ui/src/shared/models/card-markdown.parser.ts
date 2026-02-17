import type { Card, Rarity } from "./card";
import { validateCards } from "./card.schema";

const CARD_HEADING_PATTERN =
  /^##\s+(.+?)\s*\|\s*(\d+)\s*\/\s*(\d+)\s*\|\s*([A-Za-z][A-Za-z -]*)\s*$/;
const CARD_IMAGE_PATTERN = /^!\[(.+?)\]\((https?:\/\/[^\s)]+)\)\s*$/;
const CARD_FLAVOR_PATTERN = /^>\s*(.+\S)\s*$/;
const SUPPORTED_RARITIES: readonly Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "legendary",
];

function toCardId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueId(baseId: string, seenIds: Set<string>): string {
  if (!seenIds.has(baseId)) {
    seenIds.add(baseId);
    return baseId;
  }

  let suffix = 2;
  while (seenIds.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }

  const id = `${baseId}-${suffix}`;
  seenIds.add(id);
  return id;
}

function toRarity(rawRarity: string, lineNumber: number): Rarity {
  const normalizedRarity = rawRarity.trim().toLowerCase() as Rarity;
  if (SUPPORTED_RARITIES.includes(normalizedRarity)) {
    return normalizedRarity;
  }

  throw new Error(
    `Invalid rarity "${rawRarity}" on line ${lineNumber}. Supported values: ${SUPPORTED_RARITIES.join(", ")}`,
  );
}

/* 📖 # Why does the parser default missing card metadata?
The markdown schema intentionally only captures combat stats, rarity, and image.
To keep parser output compatible with the existing `Card` model and validators, we
fill optional gameplay metadata with safe defaults.
*/
export function parseCardsMarkdown(
  markdown: string,
  sourceFile: string,
): Card[] {
  const lines = markdown.split(/\r?\n/);
  const cards: Card[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < lines.length; i += 1) {
    const headingMatch = lines[i].match(CARD_HEADING_PATTERN);
    if (!headingMatch) {
      continue;
    }

    const [, name, attackText, defenseText, rarityText] = headingMatch;
    const imageLineNumber = i + 2;
    const imageLine = lines[i + 1];
    const imageMatch = imageLine?.match(CARD_IMAGE_PATTERN);

    if (!imageMatch) {
      throw new Error(
        `Missing or invalid image line after card heading on line ${i + 1}. Expected markdown image syntax on line ${imageLineNumber}.`,
      );
    }

    const [, altText, imageUrl] = imageMatch;
    if (altText.trim() !== name.trim()) {
      throw new Error(
        `Image alt text "${altText}" does not match card name "${name}" on line ${imageLineNumber}.`,
      );
    }

    const flavorLine = lines[i + 2];
    const flavorMatch = flavorLine?.match(CARD_FLAVOR_PATTERN);
    const baseId = toCardId(name);
    const card: Card = {
      id: ensureUniqueId(baseId, usedIds),
      name: name.trim(),
      attack: Number.parseInt(attackText, 10),
      defense: Number.parseInt(defenseText, 10),
      description: flavorMatch?.[1].trim(),
      image: imageUrl,
      sourceFile,
      types: ["unknown"],
      rarity: toRarity(rarityText, i + 1),
      keywords: [],
      behaviors: [],
    };

    cards.push(card);
    i += flavorMatch ? 2 : 1;
  }

  return validateCards(cards);
}
