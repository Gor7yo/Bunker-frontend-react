import {
  Activity,
  Backpack,
  BookOpen,
  Briefcase,
  Cake,
  Ghost,
  Target,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { CardKey } from "../api/types";

export const TRAIT_ICONS: Record<CardKey, LucideIcon> = {
  gender: UserRound,
  age: Cake,
  profession: Briefcase,
  health: Activity,
  phobia: Ghost,
  hobby: Target,
  baggage: Backpack,
  fact: BookOpen,
  action: Zap,
};

/** CSS color token of a characteristic (defined in global.css). */
export const traitColor = (key: CardKey) => `var(--trait-${key})`;
