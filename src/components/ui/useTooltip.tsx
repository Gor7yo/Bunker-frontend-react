import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import styles from "./Tooltip.module.css";

const EDGE = 12;
const MAX_WIDTH = 280;

/**
 * Tooltip rendered into <body> with fixed positioning, so it's never clipped
 * by tiles with overflow: hidden. Hover, keyboard focus and tap (touch).
 * Spread `anchorProps` on the element; render `tooltip` anywhere.
 */
export function useTooltip<T extends HTMLElement>(content: ReactNode | null | undefined) {
  const ref = useRef<T>(null);
  const id = useId();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const show = () => ref.current && setRect(ref.current.getBoundingClientRect());
  const hide = () => setRect(null);

  // Close on scroll / resize: the anchor moved.
  useEffect(() => {
    if (!rect) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [rect]);

  if (!content) return { anchorProps: {}, tooltip: null, hasTooltip: false };

  const below = rect !== null && rect.top < 90;
  const center = rect ? rect.left + rect.width / 2 : 0;
  const left = Math.min(Math.max(center, EDGE + MAX_WIDTH / 2), window.innerWidth - EDGE - MAX_WIDTH / 2);

  return {
    hasTooltip: true,
    anchorProps: {
      ref,
      tabIndex: 0,
      "aria-describedby": rect ? id : undefined,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      onClick: () => (rect ? hide() : show()),
    },
    tooltip: rect
      ? createPortal(
          <div
            id={id}
            role="tooltip"
            className={below ? `${styles.tooltip} ${styles.below}` : styles.tooltip}
            style={{ left, top: below ? rect.bottom + 8 : rect.top - 8, maxWidth: MAX_WIDTH }}
          >
            {content}
          </div>,
          document.body,
        )
      : null,
  };
}
