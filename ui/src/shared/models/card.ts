export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Card {
  id: string;
  name: string;
  description?: string;
  attack: number;
  defense: number;
  image?: string;
  sourceFile?: string;
  types: string[];
  rarity: Rarity;
  keywords: string[];
  behaviors: Behavior[];
  art?: string;
  set?: string;
}

export interface Behavior {
  id: string;
  trigger: Trigger;
  effect: Effect;
  stackable?: boolean;
  maxStacks?: number;
}

export type TriggerType =
  | "on_play"
  | "on_attack"
  | "on_defend"
  | "on_death"
  | "on_turn_start"
  | "on_turn_end"
  | "on_damage_received"
  | "on_kill"
  | "on_summon"
  | "on_friendly_play"
  | "on_enemy_play";

export interface Trigger {
  type: TriggerType;
  conditions?: Condition[];
}

export interface Condition {
  type:
    | "card_type"
    | "keyword"
    | "stat_below"
    | "stat_above"
    | "health_below"
    | "random_chance";
  params: Record<string, unknown>;
}

export type EffectType =
  | "deal_damage"
  | "heal"
  | "grant_immunity"
  | "draw_card"
  | "add_keyword"
  | "remove_keyword"
  | "modify_stats"
  | "summon"
  | "return_to_hand"
  | "destroy"
  | "transform"
  | "copy"
  | "steal"
  | "redirect"
  | "swap"
  | "discount"
  | "buff_adjacent"
  | "debuff_enemy";

export interface Effect {
  type: EffectType;
  params: Record<string, unknown>;
}
