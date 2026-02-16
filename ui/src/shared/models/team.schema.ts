import { z } from "zod";
import { CardSchema } from "./card.schema";

export const CardSlotSchema = z.object({
  card: CardSchema.nullable(),
});

export const LaneSchema = z.array(CardSlotSchema);

export const TeamSchema = z.object({
  lanes: z.array(LaneSchema),
});

export type TeamInput = z.input<typeof TeamSchema>;
export type TeamOutput = z.output<typeof TeamSchema>;

export function validateTeam(data: unknown): TeamOutput {
  return TeamSchema.parse(data);
}

export function isValidTeam(data: unknown): data is TeamOutput {
  return TeamSchema.safeParse(data).success;
}
