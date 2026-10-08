import { useId } from "react";

import styles from "./RoundSplash.module.css";

interface Props {
  round: number;
  /** Line under the title, e.g. "Изгнать ещё: 3". */
  subtitle: string;
}

/** How worn the sign is: 0 — fresh paint (round 1), 1 — rotten (round 7+). */
const wearOf = (round: number) => Math.min(1, Math.max(0, (round - 1) / 6));

/**
 * A big stencil "РАУНД N" that slams onto the screen. Every round the sign
 * looks older: letters warp, paint flakes off, soot and moss creep in and
 * the amber turns to rust. All procedural (SVG filters), seeded by round.
 */
export const RoundSplash = ({ round, subtitle }: Props) => {
  const uid = useId().replace(/:/g, "");
  const wear = wearOf(round);
  const seed = round * 13;

  // Thresholds for noise masks: the lower, the more of the effect.
  const holes = 0.92 - wear * 0.3; // flaked-off paint
  const soot = 0.78 - wear * 0.24;
  const moss = 0.84 - wear * 0.22;
  const sharp = 24;

  const id = (name: string) => `${name}-${uid}`;
  const text = `РАУНД ${round}`;
  const textProps = {
    x: "50%",
    y: "54%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    className: styles.text,
  };

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.sign}>
        <svg viewBox="0 0 1000 260" className={styles.svg} role="img" aria-label={text}>
          <defs>
            {/* Paint colour drifts from hazard amber to rust */}
            <linearGradient id={id("paint")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix("#f6c35a", "#a5532a", wear)} />
              <stop offset="1" stopColor={mix("#d48a1f", "#5e2a14", wear)} />
            </linearGradient>

            {/* Warped edges + flaked-off paint */}
            <filter id={id("wear")} x="-5%" y="-20%" width="110%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed={seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale={1 + wear * 14} xChannelSelector="R" yChannelSelector="G" result="warped" />
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed={seed + 1} result="grain" />
              <feColorMatrix
                in="grain"
                type="matrix"
                values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-sharp} 0 0 0 ${sharp * holes}`}
                result="holes"
              />
              <feComposite in="warped" in2="holes" operator="in" />
            </filter>

            {/* Soot and moss: patches clipped to the letters */}
            <filter id={id("soot")} x="-5%" y="-20%" width="110%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed={seed + 2} result="n" />
              <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  ${sharp / 2} 0 0 0 ${-(sharp / 2) * soot}`} result="patch" />
              <feComposite in="patch" in2="SourceAlpha" operator="in" />
            </filter>
            <filter id={id("moss")} x="-5%" y="-20%" width="110%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed={seed + 3} result="n" />
              {/* Dark olive moss with soft edges, its own grain inside */}
              <feColorMatrix
                in="n"
                type="matrix"
                values={`0.2 0 0 0 0.16  0.3 0 0 0 0.2  0 0 0 0 0.06  ${sharp / 2.5} 0 0 0 ${(-sharp / 2.5) * moss}`}
                result="patch"
              />
              <feComposite in="patch" in2="SourceAlpha" operator="in" />
            </filter>
          </defs>

          {/* Stencil shadow for depth */}
          <text {...textProps} fill="#000" opacity="0.55" transform="translate(6 8)">
            {text}
          </text>
          <g filter={`url(#${id("wear")})`}>
            <text {...textProps} fill={`url(#${id("paint")})`}>
              {text}
            </text>
            {wear > 0 && (
              <>
                <text {...textProps} fill="#000" filter={`url(#${id("soot")})`} opacity={0.4 + wear * 0.5}>
                  {text}
                </text>
                <text {...textProps} fill="#000" filter={`url(#${id("moss")})`} opacity={0.35 + wear * 0.5}>
                  {text}
                </text>
              </>
            )}
          </g>
        </svg>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
};

/** Linear blend of two hex colours. */
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(" ")})`;
}
