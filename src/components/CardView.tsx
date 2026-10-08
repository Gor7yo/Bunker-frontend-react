import type { ReactNode } from "react";
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

const CARD_ICONS: Record<CardKey, LucideIcon> = {
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
  /** Known values: own card, moderator's view, or only revealed ones. */
  card: Partial<PlayerCard>;
  /** Keys revealed to everyone. */
  revealed?: CardKey[];
  /** Show unknown rows as "???" instead of skipping them. */
  showHidden?: boolean;
  /** Extra controls at the end of a row (reveal button, moderator tools). */
  action?: (key: CardKey) => ReactNode;
  /** Highlight a row (e.g. the characteristic that must be revealed). */
  highlight?: CardKey | null;
  compact?: boolean;
}

/**
 * Characteristics list. A row is "revealed" (everyone sees it), "secret"
 * (known to the viewer only) or unknown ("???").
 */
export const CardView = ({
  card,
  revealed = [],
  showHidden = false,
  action,
  highlight,
  compact,
}: CardViewProps) => (
  <ul className={cx(styles.card, compact && styles.compact)}>
    {CARD_KEYS.map((key) => {
      const value = card[key];
      const isRevealed = revealed.includes(key);
      if (!value && !showHidden) return null;
      const Icon = CARD_ICONS[key];

      return (
        <li
          key={key}
          className={cx(
            styles.row,
            isRevealed ? styles.revealed : value ? styles.secret : styles.unknown,
            highlight === key && styles.highlight,
          )}
        >
          <span className={styles.label}>
            <Icon size={14} />
            {CARD_LABELS[key]}
          </span>
          <span className={styles.value}>{value ?? "???"}</span>
          {action && <span className={styles.action}>{action(key)}</span>}
        </li>
      );
    })}
  </ul>
);
