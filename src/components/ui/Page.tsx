import type { ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Page.module.css";

interface PageProps {
  children: ReactNode;
  /** Center a single block vertically and horizontally. */
  centered?: boolean;
  /** Narrow container for single forms. */
  narrow?: boolean;
  className?: string;
}

export const Page = ({ children, centered, narrow, className }: PageProps) => (
  <main className={cx(styles.page, centered && styles.centered)}>
    <div className={cx(styles.container, narrow && styles.narrow, className)}>{children}</div>
  </main>
);
