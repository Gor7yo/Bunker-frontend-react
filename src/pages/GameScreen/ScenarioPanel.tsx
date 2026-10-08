import { Clock, Home, Package, Radiation, Ruler } from "lucide-react";

import type { GameView } from "../../api/types";
import { Panel } from "../../components/ui";
import styles from "./GameScreen.module.css";

export const ScenarioPanel = ({ game }: { game: GameView }) => {
  const { catastrophe, bunker } = game;

  return (
    <Panel title="Сценарий" icon={<Radiation size={18} />}>
      <div className={styles.scenario}>
        <h3>{catastrophe.title}</h3>
        <p className="text-secondary text-sm">{catastrophe.description}</p>
        <p className={styles.fact}>
          <Clock size={14} /> Пережидать в бункере: <strong>{catastrophe.stay}</strong>
        </p>
      </div>

      <div className={styles.scenario}>
        <h3>
          <Home size={16} /> {bunker.title}
        </h3>
        <p className="text-secondary text-sm">{bunker.description}</p>
        <p className={styles.fact}>
          <Ruler size={14} /> {bunker.area} · <Package size={14} /> {bunker.supplies}
        </p>
        <ul className={styles.features}>
          {bunker.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p className={styles.fact}>
          Мест в бункере: <strong>{game.seats}</strong>
        </p>
      </div>
    </Panel>
  );
};
