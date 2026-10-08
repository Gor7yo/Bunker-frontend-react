import type { ReactNode } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

import { cx } from "./cx";
import styles from "./Alert.module.css";

interface AlertProps {
  tone?: "error" | "info";
  children: ReactNode;
  onClose?: () => void;
}

export const Alert = ({ tone = "error", children, onClose }: AlertProps) => (
  <div className={cx(styles.alert, styles[tone])} role={tone === "error" ? "alert" : "status"}>
    {tone === "error" ? <AlertTriangle size={18} /> : <Info size={18} />}
    <div className={styles.content}>{children}</div>
    {onClose && (
      <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
        <X size={16} />
      </button>
    )}
  </div>
);
