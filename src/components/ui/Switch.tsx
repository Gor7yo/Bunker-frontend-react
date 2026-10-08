import type { ReactNode } from "react";

import styles from "./Switch.module.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, hint, disabled }: SwitchProps) => (
  <label className={styles.row}>
    <span className={styles.text}>
      <span>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </span>
    <input
      type="checkbox"
      role="switch"
      className={styles.input}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className={styles.track} aria-hidden />
  </label>
);
