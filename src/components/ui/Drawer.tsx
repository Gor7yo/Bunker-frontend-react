import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { cx } from "./cx";
import styles from "./Drawer.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** top — slides down over the screen; right — side panel. */
  side: "top" | "right";
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Sliding panel. Stays mounted (for the animation); Escape or the backdrop
 * closes it. The right drawer has no backdrop so the cameras stay usable.
 */
export const Drawer = ({ open, onClose, side, title, icon, children }: DrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {side === "top" && (
        <div className={cx(styles.backdrop, open && styles.backdropOpen)} onClick={onClose} aria-hidden />
      )}
      <aside
        className={cx(styles.drawer, styles[side], open && styles.open)}
        aria-hidden={!open}
        inert={!open}
        aria-label={typeof title === "string" ? title : undefined}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            {icon}
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  );
};
