# Card Markdown schema

**What is this schema for?**

This schema defines how to describe multiple cards in a single markdown file using a consistent format.

**How is each card represented?**

Each card is represented by:

1. A level 2 heading (`##`) containing name, attack, defense, and rarity.
2. An image markdown link containing the card image URL.
3. Optional flavor text as a markdown blockquote.

**What is the required heading format?**

Use this exact structure:

```md
## <Name> | <Attack>/<Defense> | <Rarity>
```

Rules:

- `<Name>` is a non-empty string.
- `<Attack>` is a non-negative integer.
- `<Defense>` is a non-negative integer.
- Attack and defense are positional in `<Attack>/<Defense>` (first is attack, second is defense).
- `<Rarity>` must be one of: `Common`, `Uncommon`, `Rare`, `Legendary`.

**What is the required image format?**

Immediately after the heading, use:

```md
![<Name>](<ImageUrl>)
```

Rules:

- `<ImageUrl>` is an absolute URL (`https://...`) to the card image.
- The alt text should match `<Name>`.

**How is flavor text represented?**

Flavor text is optional.
If present, place it directly after the image line using markdown blockquote syntax:

```md
> <FlavorText>
```

Rules:

- `<FlavorText>` is a non-empty single line.
- Flavor text is parsed into `Card.description`.

**How are multiple cards represented in one file?**

Repeat the same two-line or three-line pattern for each card.
Leave one blank line between cards.

```md
## Ember Fox | 4/2 | Common
![Ember Fox](https://cdn.example.com/cards/ember-fox.png)
> It nests in warm chimneys and mistakes sparks for constellations.

## Stone Guardian | 2/8 | Rare
![Stone Guardian](https://cdn.example.com/cards/stone-guardian.png)
> Moss writes weather reports across its shoulders.
```
