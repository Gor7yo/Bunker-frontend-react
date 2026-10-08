import type { CSSProperties } from "react";
import { Info } from "lucide-react";

import { CARD_LABELS, type CardKey, type PlayerCard } from "../../api/types";
import { TRAIT_ICONS, traitColor } from "../../components/traits";
import { cx, useTooltip } from "../../components/ui";
import styles from "./TraitChips.module.css";

interface Props {
  /** Which characteristics to show, top to bottom. */
  keys: CardKey[];
  /** Column alignment: left edge or right edge of the tile. */
  align?: "start" | "end";
  /** Known values (revealed, seen privately, or everything for the moderator / at the end). */
  card: Partial<PlayerCard>;
  revealed: CardKey[];
  /** Card value → description. */
  hints: Record<string, string>;
}

/**
 * Characteristics drawn over a camera: revealed ones in their color,
 * unknown ones as a dim label ("Возраст"). Values known only to the
 * viewer are dashed. Hover a chip to read its description.
 */
export const TraitChips = ({ keys, align = "start", card, revealed, hints }: Props) => (
  <ul className={cx(styles.chips, align === "end" && styles.end)}>
    {keys.map((key) => (
      // Remount on reveal so the chip flashes.
      <Chip key={`${key}-${revealed.includes(key)}`} traitKey={key} value={card[key]} isRevealed={revealed.includes(key)} hints={hints} />
    ))}
  </ul>
);

interface ChipProps {
  traitKey: CardKey;
  value: string | undefined;
  isRevealed: boolean;
  hints: Record<string, string>;
}

const Chip = ({ traitKey, value, isRevealed, hints }: ChipProps) => {
  const Icon = TRAIT_ICONS[traitKey];
  const label = CARD_LABELS[traitKey];
  const hint = value ? hints[value] : undefined;

  const { anchorProps, tooltip, hasTooltip } = useTooltip<HTMLLIElement>(
    value ? (
      <>
        <strong>
          {label}: {value}
        </strong>
        {!isRevealed && <span className={styles.tipNote}>видно только вам</span>}
        {hint && <p className={styles.tipText}>{hint}</p>}
      </>
    ) : null,
  );

  const state = value ? (isRevealed ? styles.revealed : styles.secret) : styles.unknown;

  return (
    <li
      {...anchorProps}
      className={cx(styles.chip, state, hasTooltip && styles.hoverable)}
      style={{ "--trait": traitColor(traitKey) } as CSSProperties}
    >
      <Icon className={styles.icon} aria-hidden />
      <span className={styles.text}>{value ?? label}</span>
      {hint && <Info className={styles.info} aria-label="Есть описание" />}
      {tooltip}
    </li>
  );
};
