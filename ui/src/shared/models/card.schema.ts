import { z } from "zod";

export const ConditionSchema = z.object({
  type: z.enum([
    "card_type",
    "keyword",
    "stat_below",
    "stat_above",
    "health_below",
    "random_chance",
  ]),
  params: z.record(z.unknown()),
});

export const TriggerSchema = z.object({
  type: z.enum([
    "on_play",
    "on_attack",
    "on_defend",
    "on_death",
    "on_turn_start",
    "on_turn_end",
    "on_damage_received",
    "on_kill",
    "on_summon",
    "on_friendly_play",
    "on_enemy_play",
  ]),
  conditions: z.array(ConditionSchema).optional(),
});

export const EffectSchema = z.object({
  type: z.enum([
    "deal_damage",
    "heal",
    "grant_immunity",
    "draw_card",
    "add_keyword",
    "remove_keyword",
    "modify_stats",
    "summon",
    "return_to_hand",
    "destroy",
    "transform",
    "copy",
    "steal",
    "redirect",
    "swap",
    "discount",
    "buff_adjacent",
    "debuff_enemy",
  ]),
  params: z.record(z.unknown()),
});

export const BehaviorSchema = z.object({
  id: z.string().min(1),
  trigger: TriggerSchema,
  effect: EffectSchema,
  stackable: z.boolean().optional(),
  maxStacks: z.number().int().positive().optional(),
});

export const RaritySchema = z.enum(["common", "uncommon", "rare", "legendary"]);

export const CardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  attack: z.number().int().min(0),
  defense: z.number().int().min(0),
  types: z.array(z.string()).min(1),
  rarity: RaritySchema,
  keywords: z.array(z.string()),
  behaviors: z.array(BehaviorSchema),
  art: z.string().optional(),
  set: z.string().optional(),
});

export type CardInput = z.input<typeof CardSchema>;
export type CardOutput = z.output<typeof CardSchema>;

export function validateCard(data: unknown): CardOutput {
  return CardSchema.parse(data);
}

export function validateCards(data: unknown): CardOutput[] {
  return z.array(CardSchema).parse(data);
}

export function isValidCard(data: unknown): data is CardOutput {
  return CardSchema.safeParse(data).success;
}
