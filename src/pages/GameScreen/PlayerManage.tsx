import { observer } from "mobx-react-lite";
import { Dices, Eye, EyeOff, HeartPulse, Mic, MicOff, UserX } from "lucide-react";

import { CARD_LABELS, type CardKey, type GameView, type RoomView } from "../../api/types";
import { CardView } from "../../components/CardView";
import { Button } from "../../components/ui";
import { useGameActions } from "./gameActions";
import styles from "./GameScreen.module.css";

/** Moderator's drawer for one player: card tools, word, exile. */
export const PlayerManage = observer(
  ({ view, game, playerId }: { view: RoomView; game: GameView; playerId: string }) => {
    const { act, pending, modSeconds } = useGameActions();
    const player = view.players.find((p) => p.id === playerId);
    if (!player?.card) return <p className="text-muted">Игрок не найден.</p>;

    const inGame = player.isAlive && !player.hasLeft;
    const isSpeaker = game.speakerId === player.id;
    const revealed = Object.keys(player.revealed) as CardKey[];

    return (
      <>
        <div className={styles.manageActions}>
          {inGame ? (
            <>
              <Button
                size="sm"
                variant={isSpeaker ? "secondary" : "primary"}
                icon={isSpeaker ? <MicOff size={14} /> : <Mic size={14} />}
                disabled={pending}
                onClick={() => act("mod:speaker", { playerId: isSpeaker ? null : player.id, seconds: modSeconds })}
              >
                {isSpeaker ? "Забрать слово" : "Дать слово"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<UserX size={14} />}
                disabled={pending}
                onClick={() => confirm(`Изгнать ${player.name}?`) && act("mod:exile", { playerId: player.id })}
              >
                Изгнать
              </Button>
            </>
          ) : (
            !player.hasLeft && (
              <Button
                size="sm"
                icon={<HeartPulse size={14} />}
                disabled={pending}
                onClick={() => act("mod:revive", { playerId: player.id })}
              >
                Вернуть в игру
              </Button>
            )
          )}
        </div>

        <p className="text-sm text-secondary">
          Глаз — показать или скрыть характеристику для всех, кубик — заменить на случайную.
        </p>

        <CardView
          card={player.card}
          hints={view.hints}
          revealed={revealed}
          action={(key) => {
            const isRevealed = revealed.includes(key);
            const label = CARD_LABELS[key].toLowerCase();
            return (
              <>
                <button
                  type="button"
                  className={styles.iconButton}
                  title={isRevealed ? `Скрыть: ${label}` : `Раскрыть: ${label}`}
                  aria-label={isRevealed ? `Скрыть: ${label}` : `Раскрыть: ${label}`}
                  disabled={pending}
                  onClick={() => act(isRevealed ? "mod:hide" : "mod:reveal", { playerId, key })}
                >
                  {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  title={`Заменить: ${label}`}
                  aria-label={`Заменить: ${label}`}
                  disabled={pending}
                  onClick={() => act("mod:reroll", { playerId, key })}
                >
                  <Dices size={14} />
                </button>
              </>
            );
          }}
        />
      </>
    );
  },
);
