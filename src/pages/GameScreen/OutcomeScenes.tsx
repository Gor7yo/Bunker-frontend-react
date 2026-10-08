import { cx } from "../../components/ui";
import styles from "./OutcomeScenes.module.css";

/** Door centre; the open door rolls this far to the right. */
const CX = 96;
const CY = 96;

/**
 * The bunker's vault door, played once. "close" — you're left outside: the
 * door rolls shut and locks. "open" — you made it: the wheel unlocks and the
 * door rolls aside. Transparent background; the canvas fits the frame and
 * the rolled-away door is drawn outside it (overflow: visible), never cut.
 */
export const BunkerDoor = ({ mode }: { mode: "open" | "close" }) => (
  <svg viewBox="0 0 192 192" className={cx(styles.scene, styles[mode])} aria-hidden>
    <defs>
      <radialGradient id="door-steel" cx="40%" cy="35%" r="75%">
        <stop offset="0" stopColor="#8d8e7c" />
        <stop offset="0.55" stopColor="#5a5b4c" />
        <stop offset="1" stopColor="#2f3028" />
      </radialGradient>
    </defs>

    {/* Frame with bolts */}
    <circle cx={CX} cy={CY} r="80" fill="#1c1d17" stroke="#4a4b3e" strokeWidth="6" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={CX + Math.cos(a) * 71} cy={CY + Math.sin(a) * 71} r="3.2" fill="#77786a" />;
    })}

    {/* The passage: just darkness inside */}
    <circle cx={CX} cy={CY} r="62" fill="#050604" />

    {/* Status lamp */}
    <circle cx="176" cy="18" r="14" fill="#1c1d17" stroke="#4a4b3e" strokeWidth="3" />
    <circle cx="176" cy="18" r="8.5" className={styles.lamp} />

    {/* Door: rolls sideways, the wheel turns */}
    <g className={styles.door}>
      <circle cx={CX} cy={CY} r="64" fill="url(#door-steel)" stroke="#23241d" strokeWidth="3" />
      <circle cx={CX} cy={CY} r="50" fill="none" stroke="#2a2b23" strokeWidth="3" />
      <circle cx={CX} cy={CY} r="50" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
      <g className={styles.wheel}>
        <circle cx={CX} cy={CY} r="24" fill="none" stroke="#c9c9b4" strokeWidth="6" />
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1={CX}
            y1={CY - 34}
            x2={CX}
            y2={CY + 34}
            stroke="#c9c9b4"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${deg} ${CX} ${CY})`}
          />
        ))}
        <circle cx={CX} cy={CY} r="8" fill="#9a9a86" stroke="#2a2b23" strokeWidth="2" />
      </g>
    </g>
  </svg>
);
