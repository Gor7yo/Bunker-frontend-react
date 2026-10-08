import type { CSSProperties } from "react";
import { Check, IdCard, Mic, MicOff, Shield, Vote, Zap } from "lucide-react";

import type { GameView, RoomView } from "../../api/types";
import { traitColor } from "../../components/traits";
import chipStyles from "./TraitChips.module.css";
import styles from "./GameScreen.module.css";

/** "How to play" drawer: the goal, the round, how to read a camera tile. */
export const HelpContent = ({ view, game }: { view: RoomView; game: GameView }) => {
  const { actions, mode } = view.settings;

  return (
    <div className={styles.help}>
      <section>
        <h3>Цель</h3>
        <p>
          В бункере всего <strong>{game.seats}</strong> мест. Убедите остальных, что вы нужнее, — а лишних изгоните
          голосованием.
        </p>
      </section>

      <section>
        <h3>Раунд</h3>
        <ol className={styles.helpSteps}>
          <li>
            <strong>Раскрытие.</strong> По очереди каждый открывает одну характеристику (в первом раунде — профессию) и
            рассказывает, чем полезен.
          </li>
          <li>
            <strong>Обсуждение.</strong> Спорьте, кто лишний.
          </li>
          <li>
            <strong>Голосование.</strong> Кнопка «Голосовать» на вебке. При ничьей — оправдание и переголосование.
          </li>
          <li>
            <strong>Изгнание.</strong> Изгнанный показывает всю карту и дальше только наблюдает.
          </li>
        </ol>
        {mode === "MODERATED" && <p className="text-secondary">В этой комнате фазами управляет ведущий.</p>}
      </section>

      <section>
        <h3>Как читать вебку</h3>
        <ul className={styles.helpLegend}>
          <li>
            <Chip state="revealed" color="profession" text="Врач" /> — раскрыто, видят все
          </li>
          <li>
            <Chip state="secret" color="phobia" text="Фобия тишины" /> — знаете только вы
          </li>
          <li>
            <Chip state="unknown" color="age" text="Возраст" /> — ещё не раскрыто
          </li>
          <li>
            <span className={styles.helpBadge}>
              <Mic size={12} /> говорит
            </span>
            — сейчас его ход
          </li>
          <li>
            <span className={styles.helpBadge}>
              <Check size={12} /> голос
            </span>
            — уже проголосовал (за кого — тайна)
          </li>
          <li>
            <span className={styles.helpBadge}>
              <Vote size={12} /> 2
            </span>
            — голосов против
          </li>
          <li>
            <span className={styles.helpBadge}>
              <MicOff size={12} /> молчит
            </span>
            /
            <span className={styles.helpBadge}>
              <Shield size={12} /> иммунитет
            </span>
            — эффекты карт действий
          </li>
        </ul>
        <p className="text-secondary text-sm">Наведите на характеристику со значком ⓘ, чтобы прочитать описание.</p>
      </section>

      <section>
        <h3>
          <Zap size={14} /> Карты действий
        </h3>
        <p>
          У каждого есть одна карта действия. Сыграть её — в <IdCard size={14} className={styles.inlineIcon} />{" "}
          «Моей карте». В этой комнате:{" "}
          <strong>{actions.timing === "ANYTIME" ? "в любой момент игры" : "только в свой ход"}</strong>
          {mode === "MODERATED" && actions.approval === "MODERATOR" && ", после одобрения ведущего"}.
        </p>
      </section>

      <section>
        <h3>Управление</h3>
        <ul className={styles.helpKeys}>
          <li>
            <kbd>M</kbd> микрофон
          </li>
          <li>
            <kbd>V</kbd> камера
          </li>
          <li>
            <kbd>Esc</kbd> закрыть панель
          </li>
        </ul>
        <p className="text-secondary text-sm">
          Микрофон и камера — в углу справа снизу: зелёный — включено, красный — выключено.
        </p>
      </section>
    </div>
  );
};

const Chip = ({ state, color, text }: { state: "revealed" | "secret" | "unknown"; color: Parameters<typeof traitColor>[0]; text: string }) => (
  <span
    className={`${chipStyles.chip} ${chipStyles[state]}`}
    style={{ "--trait": traitColor(color), fontSize: 13 } as CSSProperties}
  >
    {text}
  </span>
);
