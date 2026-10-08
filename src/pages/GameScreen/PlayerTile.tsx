import { observer } from "mobx-react-lite";
import { Check, Crown, Dices, Eye, EyeOff, HeartPulse, Mic, Skull, UserX, Vote, WifiOff } from "lucide-react";

import { CARD_LABELS, type CardKey, type GameView, type PublicPlayer, type RoomView } from "../../api/types";
import { CardView } from "../../components/CardView";
import { Badge, Button, cx } from "../../components/ui";
import { roomStore } from "../../store/roomStore";
import { ParticipantVideo } from "../../voice/ParticipantVideo";
import { useGameActions } from "./gameActions";
import styles from "./GameScreen.module.css";

/** Phases where the last vote count is shown on tiles. */
const SHOW_TALLY = new Set(["VOTE_RESULT", "DEFENSE", "EXILE"]);

interface Props {
  player: PublicPlayer;
  view: RoomView;
  game: GameView;
}

export const PlayerTile = observer(({ player, view, game }: Props) => {
  const { act, pending, modSeconds } = useGameActions();
  const { isModerator, isAlivePlayer } = roomStore;

  const isMe = player.id === view.meId;
  const inGame = player.isAlive && !player.hasLeft;
  const isSpeaker = game.speakerId === player.id;
  const finished = game.phase === "FINISHED";

  const revealedKeys = Object.keys(player.revealed) as CardKey[];
  // Moderator and the final screen get full cards; others see revealed values only.
  const card = player.card ?? (isMe && view.myCard ? view.myCard : player.revealed);

  const canVote =
    game.phase === "VOTING" &&
    isAlivePlayer &&
    !isMe &&
    inGame &&
    game.candidates.includes(player.id);
  const myVote = game.myVote === player.id;

  const liveVotes = game.liveVotes
    ? Object.values(game.liveVotes).filter((target) => target === player.id).length
    : 0;
  const tally = SHOW_TALLY.has(game.phase) ? (game.lastVote?.tally[player.id] ?? 0) : 0;

  const moderatorTools = isModerator && !finished && player.card;

  return (
    <article
      className={cx(
        styles.tile,
        isSpeaker && styles.tileSpeaking,
        !inGame && styles.tileOut,
        myVote && styles.tileVoted,
        isMe && styles.tileMe,
      )}
    >
      <header className={styles.tileHeader}>
        <div className={styles.tileName}>
          {player.isHost && <Crown size={14} className={styles.hostIcon} aria-label="Хост" />}
          <strong>{player.name}</strong>
          {isMe && <Badge>вы</Badge>}
          {!player.isOnline && !player.hasLeft && <WifiOff size={14} className="text-muted" aria-label="Не в сети" />}
        </div>
        <div className={styles.tileBadges}>
          {isSpeaker && (
            <Badge tone="accent" icon={<Mic size={12} />}>
              говорит
            </Badge>
          )}
          {player.hasLeft ? (
            <Badge tone="danger">вышел</Badge>
          ) : !player.isAlive ? (
            <Badge tone="danger" icon={<Skull size={12} />}>
              изгнан
            </Badge>
          ) : null}
          {game.phase === "VOTING" && game.votedIds.includes(player.id) && (
            <Badge tone="success" icon={<Check size={12} />}>
              голос
            </Badge>
          )}
          {game.phase === "DISCUSSION" && game.readyToVote.includes(player.id) && <Badge tone="success">готов</Badge>}
          {liveVotes > 0 && <Badge tone="info">против: {liveVotes}</Badge>}
          {tally > 0 && <Badge tone="info">голосов: {tally}</Badge>}
        </div>
      </header>

      <ParticipantVideo playerId={player.id} name={player.name} canMute={isModerator && !isMe} />

      <CardView
        compact
        showHidden
        card={card}
        revealed={revealedKeys}
        action={
          moderatorTools
            ? (key) => <ModeratorCardTools playerId={player.id} cardKey={key} revealed={revealedKeys.includes(key)} />
            : undefined
        }
      />

      {(canVote || moderatorTools) && (
        <footer className={styles.tileFooter}>
          {canVote && (
            <Button
              size="sm"
              variant={myVote ? "danger" : "secondary"}
              icon={<Vote size={14} />}
              disabled={pending}
              onClick={() => act("game:vote", { playerId: player.id })}
            >
              {myVote ? "Ваш голос" : "Голосовать"}
            </Button>
          )}
          {moderatorTools && inGame && (
            <>
              <Button
                size="sm"
                variant="ghost"
                icon={<Mic size={14} />}
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
          )}
          {moderatorTools && !inGame && !player.hasLeft && (
            <Button
              size="sm"
              variant="ghost"
              icon={<HeartPulse size={14} />}
              disabled={pending}
              onClick={() => act("mod:revive", { playerId: player.id })}
            >
              Вернуть в игру
            </Button>
          )}
        </footer>
      )}
    </article>
  );
});

const ModeratorCardTools = ({
  playerId,
  cardKey,
  revealed,
}: {
  playerId: string;
  cardKey: CardKey;
  revealed: boolean;
}) => {
  const { act, pending } = useGameActions();
  const label = CARD_LABELS[cardKey].toLowerCase();

  return (
    <>
      <button
        type="button"
        className={styles.iconButton}
        title={revealed ? `Скрыть: ${label}` : `Раскрыть: ${label}`}
        aria-label={revealed ? `Скрыть: ${label}` : `Раскрыть: ${label}`}
        disabled={pending}
        onClick={() => act(revealed ? "mod:hide" : "mod:reveal", { playerId, key: cardKey })}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button
        type="button"
        className={styles.iconButton}
        title={`Заменить: ${label}`}
        aria-label={`Заменить: ${label}`}
        disabled={pending}
        onClick={() => act("mod:reroll", { playerId, key: cardKey })}
      >
        <Dices size={14} />
      </button>
    </>
  );
};
