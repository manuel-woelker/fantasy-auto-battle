import styled from "@emotion/styled";
import { css } from "@emotion/react";
import type { Card } from "../shared/models/card";

interface CardComponentProps {
  card: Card;
}

const cardContainerStyles = css`
  aspect-ratio: 5 / 7;
  width: 200px;
  background-color: #f5f0e6;
  border: 2px solid #8b7355;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-family: "Georgia", serif;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const CardContainer = styled.div`
  ${cardContainerStyles}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 1px solid #d4c4a8;
  margin-bottom: 6px;
`;

const Name = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #3d2914;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  font-weight: bold;
`;

const Stat = styled.span<{ type: "attack" | "defense" }>`
  color: ${(props) => (props.type === "attack" ? "#8b2500" : "#1a5c1a")};
  background-color: ${(props) =>
    props.type === "attack" ? "#ffe4d6" : "#d6f5d6"};
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid
    ${(props) => (props.type === "attack" ? "#cc5500" : "#228b22")};
`;

const UpperHalf = styled.div`
  flex: 1;
  min-height: 80px;
  background-color: #e8e0d0;
  border: 1px dashed #b0a080;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a09070;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 6px;
  overflow: hidden;
`;

const CardArt = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LowerHalf = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TypesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const TypeBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  background-color: #d4c4a8;
  color: #3d2914;
  border-radius: 3px;
  text-transform: capitalize;
`;

const Description = styled.p`
  font-size: 11px;
  color: #5a4a3a;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  overflow: hidden;
`;

export function CardComponent({ card }: CardComponentProps) {
  return (
    <CardContainer>
      <Header>
        <Name title={card.name}>{card.name}</Name>
        <StatsContainer>
          <Stat type="attack">⚔ {card.attack}</Stat>
          <Stat type="defense">🛡 {card.defense}</Stat>
        </StatsContainer>
      </Header>
      <UpperHalf>
        {card.image ? (
          <CardArt src={card.image} alt={card.name} loading="lazy" />
        ) : (
          "[Art placeholder]"
        )}
      </UpperHalf>
      <LowerHalf>
        <TypesContainer>
          {card.types.map((type) => (
            <TypeBadge key={type}>{type}</TypeBadge>
          ))}
        </TypesContainer>
        {card.description && <Description>{card.description}</Description>}
      </LowerHalf>
    </CardContainer>
  );
}
