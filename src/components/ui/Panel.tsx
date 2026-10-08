import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Panel.module.css";

interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  icon?: ReactNode;
  /** Content on the right side of the header. */
  actions?: ReactNode;
  /** Hazard stripe on top — for the main panel of a screen. */
  accent?: boolean;
}

export const Panel = ({ title, icon, actions, accent, className, children, ...rest }: PanelProps) => (
  <section className={cx(styles.panel, accent && styles.accent, className)} {...rest}>
    {(title || actions) && (
      <header className={styles.header}>
        {title && (
          <h2 className={styles.title}>
            {icon}
            {title}
          </h2>
        )}
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
    )}
    {children}
  </section>
);
