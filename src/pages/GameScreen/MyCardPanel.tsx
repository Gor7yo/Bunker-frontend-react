import { observer } from "mobx-react-lite";
import { Eye, IdCard } from "lucide-react";

import type { GameView, RoomView } from "../../api/types";
import { CardView } from "../../components/CardView";
import { Panel } from "../../components/ui";
import { roomStore } from "../../store/roomStore";
import { useGameActions } from "./gameActions";
import styles from "./GameScreen.module.css";

interface Props {
  view: RoomView;
  game: GameView;
}

/** Own card; during my turn hidden rows get a "reveal" button. */
export const MyCardPanel = observer(({ view, game }: Props) => {
  const { act, pending } = useGameActions();
  if (!view.myCard) return null;

  const isAuto = view.settings.mode === "AUTO";
  const isMyTurn = game.speakerId === view.meId;
  const canReveal =
    game.phase === "REVEAL" &&
    roomStore.isAlivePlayer &&
    (isAuto
      ? isMyTurn && !game.revealedThisTurn
      : game.speakerId === null || (isMyTurn && !game.revealedThisTurn));

  return (
    <Panel
      title="Ваша карта"
      icon={<IdCard size={18} />}
      className={canReveal ? styles.myCardActive : undefined}
      actions={<span className="text-muted text-sm">открыто {view.myRevealed.length}/8</span>}
    >
      {canReveal && (
        <p className="text-sm text-secondary">
          {game.requiredKey ? "В первом раунде начните с профессии." : "Выберите, что раскрыть."}
        </p>
      )}
      <CardView
        card={view.myCard}
        revealed={view.myRevealed}
        highlight={canReveal ? game.requiredKey : null}
        action={
          canReveal
            ? (key) =>
                view.myRevealed.includes(key) ? null : (
                  <button
                    type="button"
                    className={styles.revealButton}
                    disabled={pending || (game.requiredKey !== null && game.requiredKey !== key)}
                    onClick={() => act("game:reveal", { key })}
                  >
                    <Eye size={14} />
                    Раскрыть
                  </button>
                )
            : undefined
        }
      />
      <p className="text-muted text-sm">Зелёная полоса — характеристика видна всем, курсив — только вам.</p>
    </Panel>
  );
});
