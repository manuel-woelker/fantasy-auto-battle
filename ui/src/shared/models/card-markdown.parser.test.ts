import { describe, expect, it } from "vitest";
import { parseCardsMarkdown } from "./card-markdown.parser";

describe("parseCardsMarkdown", () => {
  it("parses multiple cards from markdown headings and image lines", () => {
    const markdown = [
      "## Ember Fox | 4/2 | Common",
      "![Ember Fox](https://cdn.example.com/cards/ember-fox.png)",
      "> It nests in warm chimneys and mistakes sparks for constellations.",
      "",
      "## Stone Guardian | 2/8 | rare",
      "![Stone Guardian](https://cdn.example.com/cards/stone-guardian.png)",
    ].join("\n");

    const cards = parseCardsMarkdown(markdown, "cards/core.md");

    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({
      id: "ember-fox",
      name: "Ember Fox",
      attack: 4,
      defense: 2,
      rarity: "common",
      description:
        "It nests in warm chimneys and mistakes sparks for constellations.",
      image: "https://cdn.example.com/cards/ember-fox.png",
      sourceFile: "cards/core.md",
      types: ["unknown"],
      keywords: [],
      behaviors: [],
    });
    expect(cards[1]).toMatchObject({
      id: "stone-guardian",
      name: "Stone Guardian",
      attack: 2,
      defense: 8,
      rarity: "rare",
      description: undefined,
      image: "https://cdn.example.com/cards/stone-guardian.png",
      sourceFile: "cards/core.md",
    });
  });

  it("creates unique ids when card names repeat", () => {
    const markdown = [
      "## Wolf Pup | 2/1 | Common",
      "![Wolf Pup](https://cdn.example.com/cards/wolf-pup-a.png)",
      "## Wolf Pup | 3/2 | Uncommon",
      "![Wolf Pup](https://cdn.example.com/cards/wolf-pup-b.png)",
    ].join("\n");

    const cards = parseCardsMarkdown(markdown, "cards/dupes.md");

    expect(cards.map((card) => card.id)).toEqual(["wolf-pup", "wolf-pup-2"]);
  });

  it("throws when an image line is missing after a card heading", () => {
    const markdown = "## Ember Fox | 4/2 | Common";

    expect(() => parseCardsMarkdown(markdown, "cards/broken.md")).toThrow(
      "Missing or invalid image line",
    );
  });

  it("throws when image alt text does not match card name", () => {
    const markdown = [
      "## Ember Fox | 4/2 | Common",
      "![Wrong Name](https://cdn.example.com/cards/ember-fox.png)",
    ].join("\n");

    expect(() => parseCardsMarkdown(markdown, "cards/broken.md")).toThrow(
      "does not match card name",
    );
  });

  it("throws when rarity is unsupported", () => {
    const markdown = [
      "## Storm Oracle | 7/5 | Epic",
      "![Storm Oracle](https://cdn.example.com/cards/storm-oracle.png)",
    ].join("\n");

    expect(() => parseCardsMarkdown(markdown, "cards/broken.md")).toThrow(
      'Invalid rarity "Epic"',
    );
  });
});
