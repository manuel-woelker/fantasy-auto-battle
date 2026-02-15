import { describe, it, expect } from "vitest";
import {
  CARDS,
  CARDS_BY_ID,
  getCardById,
  getCardsByType,
  getCardsByRarity,
  getCardsByKeyword,
  getCardsBySet,
  validateCard,
  validateCards,
  isValidCard,
} from "./index";

describe("Card Types", () => {
  it("should export all card types", () => {
    expect(CARDS.length).toBeGreaterThan(0);
    expect(CARDS_BY_ID).toBeDefined();
    expect(getCardById).toBeDefined();
  });
});

describe("validateCard", () => {
  it("should validate a valid card", () => {
    const validCard = {
      id: "test-card",
      name: "Test Card",
      attack: 5,
      defense: 3,
      types: ["human"],
      rarity: "common" as const,
      keywords: ["taunt"],
      behaviors: [],
    };

    const result = validateCard(validCard);
    expect(result.id).toBe("test-card");
    expect(result.name).toBe("Test Card");
  });

  it("should throw on invalid card (missing required field)", () => {
    const invalidCard = {
      id: "test-card",
      attack: 5,
      defense: 3,
      types: ["human"],
      rarity: "common",
      keywords: [],
      behaviors: [],
    };

    expect(() => validateCard(invalidCard)).toThrow();
  });

  it("should throw on invalid card (negative attack)", () => {
    const invalidCard = {
      id: "test-card",
      name: "Test Card",
      attack: -1,
      defense: 3,
      types: ["human"],
      rarity: "common",
      keywords: [],
      behaviors: [],
    };

    expect(() => validateCard(invalidCard)).toThrow();
  });

  it("should throw on invalid card (empty types array)", () => {
    const invalidCard = {
      id: "test-card",
      name: "Test Card",
      attack: 5,
      defense: 3,
      types: [],
      rarity: "common",
      keywords: [],
      behaviors: [],
    };

    expect(() => validateCard(invalidCard)).toThrow();
  });

  it("should throw on invalid card (invalid rarity)", () => {
    const invalidCard = {
      id: "test-card",
      name: "Test Card",
      attack: 5,
      defense: 3,
      types: ["human"],
      rarity: "epic",
      keywords: [],
      behaviors: [],
    };

    expect(() => validateCard(invalidCard)).toThrow();
  });
});

describe("validateCards", () => {
  it("should validate an array of cards", () => {
    const cards = [
      {
        id: "card-1",
        name: "Card 1",
        attack: 1,
        defense: 1,
        types: ["beast"],
        rarity: "common" as const,
        keywords: [],
        behaviors: [],
      },
      {
        id: "card-2",
        name: "Card 2",
        attack: 2,
        defense: 2,
        types: ["beast"],
        rarity: "common" as const,
        keywords: [],
        behaviors: [],
      },
    ];

    const result = validateCards(cards);
    expect(result).toHaveLength(2);
  });

  it("should throw if any card in array is invalid", () => {
    const cards = [
      {
        id: "card-1",
        name: "Card 1",
        attack: 1,
        defense: 1,
        types: ["beast"],
        rarity: "common" as const,
        keywords: [],
        behaviors: [],
      },
      {
        id: "card-invalid",
        attack: -5,
        defense: 1,
        types: ["beast"],
        rarity: "common" as const,
        keywords: [],
        behaviors: [],
      },
    ];

    expect(() => validateCards(cards)).toThrow();
  });
});

describe("isValidCard", () => {
  it("should return true for valid card", () => {
    const validCard = {
      id: "test",
      name: "Test",
      attack: 1,
      defense: 1,
      types: ["human"],
      rarity: "common" as const,
      keywords: [],
      behaviors: [],
    };

    expect(isValidCard(validCard)).toBe(true);
  });

  it("should return false for invalid card", () => {
    const invalidCard = {
      id: "test",
      attack: -1,
      defense: 1,
      types: ["human"],
      rarity: "common" as const,
      keywords: [],
      behaviors: [],
    };

    expect(isValidCard(invalidCard)).toBe(false);
  });
});

describe("CARDS", () => {
  it("should have 10 example cards", () => {
    expect(CARDS).toHaveLength(10);
  });

  it("should have unique ids", () => {
    const ids = CARDS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields", () => {
    for (const card of CARDS) {
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.attack).toBeGreaterThanOrEqual(0);
      expect(card.defense).toBeGreaterThanOrEqual(0);
      expect(card.types.length).toBeGreaterThan(0);
      expect(card.rarity).toMatch(/common|uncommon|rare|legendary/);
      expect(card.keywords).toBeDefined();
      expect(card.behaviors).toBeDefined();
    }
  });

  it("should validate all cards against schema", () => {
    for (const card of CARDS) {
      expect(isValidCard(card)).toBe(true);
    }
  });

  it("should have at least one legendary card", () => {
    const legendaries = CARDS.filter((c) => c.rarity === "legendary");
    expect(legendaries.length).toBeGreaterThan(0);
  });
});

describe("getCardById", () => {
  it("should return card by id", () => {
    const dragon = getCardById("dragon");
    expect(dragon).toBeDefined();
    expect(dragon?.name).toBe("Dragon");
  });

  it("should return undefined for unknown id", () => {
    const unknown = getCardById("unknown-card");
    expect(unknown).toBeUndefined();
  });
});

describe("getCardsByType", () => {
  it("should return cards by type", () => {
    const humans = getCardsByType("human");
    expect(humans.length).toBeGreaterThan(0);
    expect(humans.every((c) => c.types.includes("human"))).toBe(true);
  });
});

describe("getCardsByRarity", () => {
  it("should return cards by rarity", () => {
    const commons = getCardsByRarity("common");
    expect(commons.length).toBeGreaterThan(0);
    expect(commons.every((c) => c.rarity === "common")).toBe(true);
  });
});

describe("getCardsByKeyword", () => {
  it("should return cards by keyword", () => {
    const tauntCards = getCardsByKeyword("taunt");
    expect(tauntCards.length).toBeGreaterThan(0);
    expect(tauntCards.every((c) => c.keywords.includes("taunt"))).toBe(true);
  });
});

describe("getCardsBySet", () => {
  it("should return cards by set", () => {
    const coreCards = getCardsBySet("core");
    expect(coreCards.length).toBe(CARDS.length);
  });
});

describe("CARDS_BY_ID", () => {
  it("should have all cards indexed by id", () => {
    for (const card of CARDS) {
      expect(CARDS_BY_ID[card.id]).toBeDefined();
      expect(CARDS_BY_ID[card.id]).toEqual(card);
    }
  });
});
