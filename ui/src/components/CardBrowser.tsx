import { useState, useMemo } from "react";
import styled from "@emotion/styled";
import { CardComponent } from "./CardComponent";
import { CARDS } from "../shared/models/cards";
import type { Card } from "../shared/models/card";

interface CardBrowserProps {
  cards?: Card[];
}

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px;
  background-color: #f5f0e6;
  border: 1px solid #d4c4a8;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid #b0a080;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  color: #3d2914;

  &::placeholder {
    color: #a09070;
  }

  &:focus {
    outline: none;
    border-color: #8b7355;
    box-shadow: 0 0 0 2px rgba(139, 115, 85, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #b0a080;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  color: #3d2914;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #8b7355;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #8b7355;
  font-size: 16px;
  font-style: italic;
`;

export function CardBrowser({ cards = CARDS }: CardBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach((card) => card.types.forEach((type) => types.add(type)));
    return Array.from(types).sort();
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        searchQuery === "" ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "" || card.types.includes(selectedType);
      const matchesRarity =
        selectedRarity === "" || card.rarity === selectedRarity;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [cards, searchQuery, selectedType, selectedRarity]);

  return (
    <BrowserContainer>
      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterSelect
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="legendary">Legendary</option>
        </FilterSelect>
      </FilterBar>
      {filteredCards.length > 0 ? (
        <Grid>
          {filteredCards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </Grid>
      ) : (
        <EmptyState>No cards match your filters.</EmptyState>
      )}
    </BrowserContainer>
  );
}
