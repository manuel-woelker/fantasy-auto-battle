# Card data model

**What does the data model for cards look like?**

## Combat attributes - Attack and Defense

Cards have two combat values:

1. **Attack**, which determines how much damage they deal.
2. **Defense**, which determines how much damage they can take before fainting (which takes them out of combat)

These values are positive whole integers.

## Types

A card can have several types, that categorizes or classifies this card.
The type roughly describes what the card is (e.g. a toad, cat, etc.)
Types may have impact on certain effects or actions.

The types are short strings like "toad", "cat", "bird", etc.

## Behaviours

Behaviours are rules that determine how the cards interact with other cards.
Behaviours consist of two parts:

1. **Triggers**: Defines the conditions when the behaviour is activated.
2. **Effects**: Defines the consequences of meeting a trigger condition.

Triggers and effects can be parametrized to only affect certain types or cards.
They can also be "stacked", meaning that they can be triggered multiple times, with corresponding effects.

# Team data model

**What does the data model for a team look like?**

A team has an array of lanes.

**What does each lane contain?**

Each lane has an array of card slots.

**Why are lanes and card slots arrays instead of fixed-size tuples?**

Mods or effects may change team geometry during gameplay, so the model stays dynamic.

**What is stored in a card slot?**

Each card slot stores a full `card` object or `null` when the slot is empty.

**Why store the full card object instead of only a `cardId`?**

Card values can change during gameplay, so the slot should reference the live card state.
