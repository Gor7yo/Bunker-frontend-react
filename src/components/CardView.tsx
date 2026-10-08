import {
  Activity,
  Backpack,
  BookOpen,
  Briefcase,
  Cake,
  Ghost,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { CARD_KEYS, CARD_LABELS, type CardKey, type PlayerCard } from "../api/types";
import { cx } from "./ui";
import styles from "./CardView.module.css";

const ICONS: Record<CardKey, LucideIcon> = {
  profession: Briefcase,
  age: Cake,
  health: Activity,
  phobia: Ghost,
  hobby: Target,
  baggage: Backpack,
  fact: BookOpen,
  action: Zap,
};

interface CardViewProps {
  card: Partial<PlayerCard>;
  /** Keys already revealed to everyone. */
  revealed?: CardKey[];
  /** Show hidden rows as "???" instead of skipping them. */
  showHidden?: boolean;
}

export const CardView = ({ card, revealed = [], showHidden = false }: CardViewProps) => (
  <ul className={styles.card}>
    {CARD_KEYS.map((key) => {
      const value = card[key];
      if (!value && !showHidden) return null;
      const Icon = ICONS[key];
      return (
        <li key={key} className={cx(styles.row, revealed.includes(key) && styles.revealed)}>
          <span className={styles.label}>
            <Icon size={14} />
            {CARD_LABELS[key]}
          </span>
          <span className={value ? styles.value : styles.hidden}>{value ?? "???"}</span>
        </li>
      );
    })}
  </ul>
);
