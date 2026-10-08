import { useState } from "react";
import { Bot, Gavel } from "lucide-react";

import {
  TITLE_MAX_LENGTH,
  type GameMode,
  type RoomSettings,
  type RoomTimers,
  type SettingsPatch,
} from "../api/types";
import { Field, Input, Select, Switch, cx } from "./ui";
import styles from "./SettingsForm.module.css";

const MODE_OPTIONS: { value: GameMode; title: string; hint: string; icon: typeof Bot }[] = [
  {
    value: "AUTO",
    title: "Автоматическая",
    hint: "Раунды, таймеры и голосования идут сами",
    icon: Bot,
  },
  {
    value: "MODERATED",
    title: "С ведущим",
    hint: "Ведущий не играет и управляет всей игрой",
    icon: Gavel,
  },
];

const PLAYER_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 4);

const TIMER_FIELDS: { key: keyof RoomTimers; label: string; options: number[] }[] = [
  { key: "reveal", label: "Раскрытие (на игрока)", options: [30, 45, 60, 90, 120, 180] },
  { key: "discussion", label: "Обсуждение", options: [60, 120, 180, 240, 300, 420, 600] },
  { key: "voting", label: "Голосование", options: [15, 20, 30, 45, 60, 90] },
  { key: "defense", label: "Оправдание", options: [15, 30, 45, 60, 90, 120] },
];

const formatSeconds = (s: number) => {
  if (s < 60) return `${s} сек`;
  const min = Math.floor(s / 60);
  return s % 60 === 0 ? `${min} мин` : `${min} мин ${s % 60} сек`;
};

interface SettingsFormProps {
  value: RoomSettings;
  onChange: (patch: SettingsPatch) => void;
  disabled?: boolean;
  titlePlaceholder?: string;
}

export const SettingsForm = ({ value, onChange, disabled, titlePlaceholder }: SettingsFormProps) => (
  <div className={styles.form}>
    <TitleInput
      // Remount when the server value changes so the draft resets.
      key={value.title}
      initial={value.title}
      placeholder={titlePlaceholder}
      disabled={disabled}
      onCommit={(title) => onChange({ title })}
    />

    <Switch
      label="Публичная комната"
      hint={value.isPublic ? "Видна всем на главной странице" : "Вход только по коду"}
      checked={value.isPublic}
      disabled={disabled}
      onChange={(isPublic) => onChange({ isPublic })}
    />

    <div className={styles.modes} role="radiogroup" aria-label="Режим игры">
      {MODE_OPTIONS.map(({ value: mode, title, hint, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value.mode === mode}
          disabled={disabled}
          className={cx(styles.mode, value.mode === mode && styles.modeActive)}
          onClick={() => value.mode !== mode && onChange({ mode })}
        >
          <Icon size={18} />
          <strong>{title}</strong>
          <span>{hint}</span>
        </button>
      ))}
    </div>

    <Field label="Максимум игроков">
      <Select
        disabled={disabled}
        value={value.maxPlayers}
        onChange={(e) => onChange({ maxPlayers: Number(e.target.value) })}
      >
        {PLAYER_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>
    </Field>

    {value.mode === "AUTO" && (
      <div className={styles.grid}>
        {TIMER_FIELDS.map((field) => (
          <Field key={field.key} label={field.label}>
            <Select
              disabled={disabled}
              value={value.timers[field.key]}
              onChange={(e) => onChange({ timers: { [field.key]: Number(e.target.value) } })}
            >
              {/* Keep the current value selectable even if it's not a preset. */}
              {[...new Set([...field.options, value.timers[field.key]])]
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    {formatSeconds(s)}
                  </option>
                ))}
            </Select>
          </Field>
        ))}
      </div>
    )}
  </div>
);

interface TitleInputProps {
  initial: string;
  placeholder?: string;
  disabled?: boolean;
  onCommit: (title: string) => void;
}

/** Commits on blur / Enter, so typing doesn't spam the server. */
const TitleInput = ({ initial, placeholder, disabled, onCommit }: TitleInputProps) => {
  const [draft, setDraft] = useState(initial);

  const commit = () => {
    const title = draft.trim();
    if (title === initial) return;
    if (!title && !placeholder) {
      setDraft(initial);
      return;
    }
    onCommit(title);
  };

  return (
    <Field label="Название комнаты">
      <Input
        value={draft}
        placeholder={placeholder}
        maxLength={TITLE_MAX_LENGTH}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </Field>
  );
};
