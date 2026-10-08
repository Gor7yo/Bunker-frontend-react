import type { ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "accent" | "success" | "danger" | "info";

export const Badge = ({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) => (
  <span className={cx(styles.badge, styles[tone])}>
    {icon}
    {children}
  </span>
);
