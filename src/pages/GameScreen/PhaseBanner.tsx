import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Check, Hourglass, Mic, SkipForward, Timer, Vote } from "lucide-react";

import type { GameView, RoomView } from "../../api/types";
import { Badge, Button, cx } from "../../components/ui";
import { formatClock, useCountdown } from "../../hooks/useCountdown";
import { roomStore } from "../../store/roomStore";
import { PHASE_LABELS, useGameActions } from "./gameActions";
import styles from "./GameScreen.module.css";

interface Props {
  view: RoomView;
  game: GameView;
}

/** Current phase, its timer and the main action for this viewer. */
export const PhaseBanner = observer(({ view, game }: Props) => {
  const { act, pending } = useGameActions();
  const secondsLeft = useCountdown(game.phaseEndsAt, roomStore.clockOffset);
  const { isAlivePlayer } = roomStore;
  const isAuto = view.settings.mode === "AUTO";
  const meId = view.meId;

  const nameOf = (id: string | null) => view.players.find((p) => p.id === id)?.name ?? "—";
  const isMyTurn = game.speakerId === meId;
  const online = view.players.filter((p) => p.role === "PLAYER" && p.isAlive && !p.hasLeft && p.isOnline);

  let title = PHASE_LABELS[game.phase];
  let text: string;
  let action: ReactNode = null;

  switch (game.phase) {
    case "INTRO":
      title = `Катастрофа: ${game.catastrophe.title}`;
      text = isAuto
        ? "Изучите катастрофу и бункер справа. Скоро начнётся первый раунд."
        : "Ведущий рассказывает о катастрофе и начнёт первый раунд.";
      break;

    case "REVEAL":
      if (isMyTurn) {
        text = game.revealedThisTurn
          ? "Расскажите, чем вы полезны бункеру, и передайте ход."
          : "Ваш ход: раскройте одну характеристику в своей карте.";
        action = (
          <Button
            variant="primary"
            icon={<SkipForward size={16} />}
            disabled={pending || (isAuto && !game.revealedThisTurn)}
            onClick={() => act("game:endTurn")}
          >
            Закончить ход
          </Button>
        );
      } else if (game.speakerId) {
        text = `Ходит ${nameOf(game.speakerId)}.`;
        if (game.turnQueue.length > 0) text += ` Дальше: ${game.turnQueue.map(nameOf).join(", ")}.`;
      } else {
        text = isAuto ? "Раскрытие характеристик." : "Раскрывайте характеристики по указанию ведущего.";
      }
      break;

    case "DISCUSSION": {
      text = "Обсуждайте, кому не место в бункере.";
      if (isAuto && isAlivePlayer) {
        const ready = game.readyToVote.includes(meId);
        action = (
          <Button
            variant={ready ? "success" : "secondary"}
            icon={ready ? <Check size={16} /> : <Vote size={16} />}
            disabled={pending}
            onClick={() => act("game:readyToVote")}
          >
            Готов голосовать {game.readyToVote.length}/{online.length}
          </Button>
        );
      }
      break;
    }

    case "VOTING":
      title = game.isRevote ? "Переголосование" : "Голосование";
      text = isAlivePlayer
        ? game.myVote
          ? `Ваш голос: ${nameOf(game.myVote)}. Можно передумать, пока голосование открыто.`
          : "Выберите игрока, который не попадёт в бункер."
        : "Игроки голосуют.";
      if (game.isRevote) text += ` Кандидаты: ${game.candidates.map(nameOf).join(", ")}.`;
      action = (
        <Badge tone="info">
          проголосовали {game.votedIds.length}/{game.aliveCount}
        </Badge>
      );
      break;

    case "DEFENSE":
      title = "Оправдание";
      text = isMyTurn
        ? "Ничья! Убедите остальных, что вы нужны бункеру."
        : `Ничья. Оправдывается ${nameOf(game.speakerId)}.`;
      if (isMyTurn) {
        action = (
          <Button variant="primary" icon={<Mic size={16} />} disabled={pending} onClick={() => act("game:endTurn")}>
            Закончить речь
          </Button>
        );
      }
      break;

    case "VOTE_RESULT": {
      const tally = game.lastVote?.tally ?? {};
      const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      text = rows.length
        ? rows.map(([id, n]) => `${nameOf(id)} — ${n}`).join(", ") + ". Решение за ведущим."
        : "Никто не проголосовал. Решение за ведущим.";
      break;
    }

    case "EXILE":
      title = "Изгнание";
      text = game.lastExiledId
        ? `${nameOf(game.lastExiledId)} ${game.exiledByLot ? "покидает бункер по жребию" : "изгнан из бункера"}. Его карта теперь открыта.`
        : "Игрок покинул бункер.";
      break;

    default:
      text = "";
  }

  const urgent = secondsLeft !== null && secondsLeft <= 10;

  return (
    <section className={cx(styles.banner, isMyTurn && styles.bannerMine)} aria-live="polite">
      <div className={styles.bannerText}>
        <span className={styles.bannerPhase}>
          {game.round > 0 ? `Раунд ${game.round} · ` : ""}
          {PHASE_LABELS[game.phase]}
        </span>
        <h2 className={styles.bannerTitle}>{title}</h2>
        <p>{text}</p>
      </div>
      <div className={styles.bannerSide}>
        {secondsLeft !== null && (
          <span className={cx(styles.clock, urgent && styles.clockUrgent)} aria-label="Осталось времени">
            {urgent ? <Hourglass size={18} /> : <Timer size={18} />}
            {formatClock(secondsLeft)}
          </span>
        )}
        {action}
      </div>
    </section>
  );
});
