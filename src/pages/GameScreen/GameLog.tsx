import { ScrollText } from "lucide-react";

import type { GameLogEntry } from "../../api/types";
import { Panel, cx } from "../../components/ui";
import styles from "./GameScreen.module.css";

const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

export const GameLog = ({ entries }: { entries: GameLogEntry[] }) => (
  <Panel title="Журнал" icon={<ScrollText size={18} />}>
    <ol className={styles.log}>
      {[...entries].reverse().map((entry, i) => (
        <li key={`${entry.at}-${i}`} className={cx(styles.logEntry, styles[`log_${entry.tone}`])}>
          <time className="mono">{timeFormat.format(entry.at)}</time>
          <span>{entry.text}</span>
        </li>
      ))}
    </ol>
  </Panel>
);
