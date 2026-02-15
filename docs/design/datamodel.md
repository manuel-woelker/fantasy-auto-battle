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
