import type { Card } from "./card";

export interface CardSlot {
  card: Card | null;
}

/* 📖 # Why use arrays for lanes and team lanes?
The board shape may change due to mods or effects, so the model stays dynamic.
*/
export type Lane = CardSlot[];

export type TeamLanes = Lane[];

export interface Team {
  lanes: TeamLanes;
}
