import { useEffect, useRef, useState } from "react";

interface FitOptions {
  /** Tile width / height. */
  aspect?: number;
  gap?: number;
  /** Below this width tiles stop shrinking and the grid scrolls. */
  minWidth?: number;
}

/**
 * Picks the tile width at which `count` tiles of a fixed aspect ratio fill
 * the container as much as possible (tries every column count).
 */
export function useFitGrid<T extends HTMLElement>(
  count: number,
  { aspect = 16 / 9, gap = 12, minWidth = 160 }: FitOptions = {},
) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Not enough room for two columns — one full-width column.
  if (size.width < minWidth * 2 + gap) {
    return { ref, tileWidth: Math.floor(size.width), ready: size.width > 0 };
  }

  let best = 0;
  for (let cols = 1; cols <= Math.max(count, 1); cols++) {
    const rows = Math.ceil(count / cols);
    const byWidth = (size.width - gap * (cols - 1)) / cols;
    const byHeight = ((size.height - gap * (rows - 1)) / rows) * aspect;
    best = Math.max(best, Math.min(byWidth, byHeight));
  }

  const tileWidth = Math.floor(Math.min(size.width, Math.max(minWidth, best)));
  return { ref, tileWidth, ready: size.width > 0 };
}
