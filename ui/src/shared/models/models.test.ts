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
  validateTeam,
  isValidTeam,
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
  it("should load cards from markdown library files", () => {
    expect(CARDS).toHaveLength(18);
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
    const sampleCard = CARDS[0];
    const result = getCardById(sampleCard.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(sampleCard.id);
  });

  it("should return undefined for unknown id", () => {
    const unknown = getCardById("unknown-card");
    expect(unknown).toBeUndefined();
  });
});

describe("getCardsByType", () => {
  it("should return cards by type", () => {
    const unknownTypeCards = getCardsByType("unknown");
    expect(unknownTypeCards.length).toBeGreaterThan(0);
    expect(unknownTypeCards.every((c) => c.types.includes("unknown"))).toBe(
      true,
    );
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
    const unknownKeywordCards = getCardsByKeyword("non-existent-keyword");
    expect(unknownKeywordCards).toHaveLength(0);
  });
});

describe("getCardsBySet", () => {
  it("should return cards by set", () => {
    const setName = CARDS[0].set;
    expect(setName).toBeDefined();
    const setCards = getCardsBySet(setName ?? "");
    expect(setCards.length).toBeGreaterThan(0);
    expect(setCards.every((c) => c.set === setName)).toBe(true);
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

describe("Team model", () => {
  it("should validate a team with 3 lanes and 2 card slots per lane", () => {
    const team = {
      lanes: [
        [{ card: CARDS[0] }, { card: null }],
        [{ card: CARDS[2] }, { card: CARDS[3] }],
        [{ card: null }, { card: CARDS[5] }],
      ],
    };

    const result = validateTeam(team);
    expect(result.lanes).toHaveLength(3);
    expect(result.lanes[0]).toHaveLength(2);
    expect(result.lanes[1]).toHaveLength(2);
    expect(result.lanes[2]).toHaveLength(2);
  });

  it("should allow dynamic lane and slot counts", () => {
    const dynamicTeam = {
      lanes: [
        [{ card: null }, { card: null }],
        [{ card: null }, { card: CARDS[0] }, { card: CARDS[1] }],
      ],
    };

    expect(isValidTeam(dynamicTeam)).toBe(true);
  });

  it("should accept card as null or a valid card object", () => {
    expect(
      isValidTeam({
        lanes: [
          [{ card: null }, { card: CARDS[4] }],
          [{ card: CARDS[1] }, { card: null }],
          [{ card: CARDS[5] }, { card: CARDS[2] }],
        ],
      }),
    ).toBe(true);

    expect(
      isValidTeam({
        lanes: [
          [{ card: { id: "invalid-card" } }, { card: CARDS[4] }],
          [{ card: CARDS[1] }, { card: null }],
          [{ card: CARDS[5] }, { card: CARDS[2] }],
        ],
      }),
    ).toBe(false);
  });
});
