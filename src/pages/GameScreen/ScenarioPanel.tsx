import { Clock, Home, Package, Radiation, Ruler, Users } from "lucide-react";

import type { GameView } from "../../api/types";
import styles from "./GameScreen.module.css";

/** Contents of the "Scenario" drawer: catastrophe and bunker. */
export const ScenarioContent = ({ game }: { game: GameView }) => {
  const { catastrophe, bunker } = game;

  return (
    <>
      <section className={styles.scenario}>
        <h3>
          <Radiation size={16} /> {catastrophe.title}
        </h3>
        <p className="text-secondary">{catastrophe.description}</p>
        <p className={styles.fact}>
          <Clock size={14} /> Пережидать в бункере: <strong>{catastrophe.stay}</strong>
        </p>
      </section>

      <section className={styles.scenario}>
        <h3>
          <Home size={16} /> {bunker.title}
        </h3>
        <p className="text-secondary">{bunker.description}</p>
        <p className={styles.fact}>
          <Ruler size={14} /> {bunker.area} · <Package size={14} /> {bunker.supplies}
        </p>
        <ul className={styles.features}>
          {bunker.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p className={styles.fact}>
          <Users size={14} /> Мест в бункере: <strong>{game.seats}</strong>
        </p>
      </section>
    </>
  );
};
