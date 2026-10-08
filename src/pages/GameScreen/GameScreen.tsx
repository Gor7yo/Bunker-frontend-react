import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoorOpen, LogOut, ShieldCheck, Undo2, Users } from "lucide-react";

import type { GameView, RoomView } from "../../api/types";
import { Alert, Badge, Button, Page, Panel } from "../../components/ui";
import { useAction } from "../../hooks/useAction";
import { roomStore } from "../../store/roomStore";
import { MediaControls } from "../../voice/MediaControls";
import { ParticipantVideo } from "../../voice/ParticipantVideo";
import { useVoice } from "../../voice/voiceContext";
import { GameActionsContext, type GameActions, type GameEvent } from "./gameActions";
import { GameLog } from "./GameLog";
import { ModeratorPanel } from "./ModeratorPanel";
import { MyCardPanel } from "./MyCardPanel";
import { PhaseBanner } from "./PhaseBanner";
import { PlayerTile } from "./PlayerTile";
import { ScenarioPanel } from "./ScenarioPanel";
import styles from "./GameScreen.module.css";

export const GameScreen = observer(({ view }: { view: RoomView }) => {
  const navigate = useNavigate();
  const { run, pending, error, setError } = useAction();
  const [modSeconds, setModSeconds] = useState<number | null>(60);
  const { isHost, isModerator } = roomStore;
  const game = view.game;

  const actions: GameActions = {
    act: (event: GameEvent, payload?: object) => void run(() => roomStore.gameAction(event, payload)),
    pending,
    modSeconds,
  };

  const leave = () => {
    if (!confirm("Покинуть игру? Вернуться в неё будет нельзя.")) return;
    void run(async () => {
      await roomStore.leave();
      navigate("/");
    });
  };

  const backToLobby = () => {
    if (game?.phase !== "FINISHED" && !confirm("Прервать игру и вернуть всех в лобби?")) return;
    actions.act("game:backToLobby");
  };

  if (!game) return null;

  const participants = view.players.filter((p) => p.role === "PLAYER");
  const moderator = view.players.find((p) => p.role === "MODERATOR" && !p.hasLeft);

  return (
    <GameActionsContext.Provider value={actions}>
      <Page className={styles.page}>
        <Panel accent className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{view.settings.title}</h1>
            <div className={styles.meta}>
              {game.round > 0 && <Badge tone="accent">раунд {game.round}</Badge>}
              <Badge icon={<Users size={12} />}>
                в игре {game.aliveCount} · мест {game.seats}
              </Badge>
              {view.settings.mode === "MODERATED" && <Badge>с ведущим</Badge>}
              {!roomStore.connected && <Badge tone="danger">нет связи</Badge>}
            </div>
          </div>
          <div className={styles.headerActions}>
            <MediaControls />
            {isHost && (
              <Button size="sm" variant="ghost" icon={<Undo2 size={14} />} onClick={backToLobby}>
                {game.phase === "FINISHED" ? "В лобби" : "Прервать"}
              </Button>
            )}
            <Button size="sm" variant="danger" icon={<LogOut size={14} />} onClick={leave}>
              Выйти
            </Button>
          </div>
        </Panel>

        {error && <Alert onClose={() => setError(null)}>{error}</Alert>}

        {game.phase === "FINISHED" ? (
          <FinalPanel view={view} game={game} onBackToLobby={isHost ? backToLobby : undefined} />
        ) : (
          <PhaseBanner view={view} game={game} />
        )}

        <div className={styles.layout}>
          <div className={styles.main}>
            {isModerator && game.phase !== "FINISHED" && (
              <ModeratorPanel view={view} game={game} seconds={modSeconds} onSecondsChange={setModSeconds} />
            )}
            <section className={styles.board} aria-label="Игроки">
              {participants.map((player) => (
                <PlayerTile key={player.id} player={player} view={view} game={game} />
              ))}
            </section>
          </div>

          <aside className={styles.side}>
            {moderator && <ModeratorVideo id={moderator.id} name={moderator.name} />}
            {view.myCard && <MyCardPanel view={view} game={game} />}
            <ScenarioPanel game={game} />
            <GameLog entries={game.log} />
          </aside>
        </div>
      </Page>
    </GameActionsContext.Provider>
  );
});

const ModeratorVideo = ({ id, name }: { id: string; name: string }) => {
  const { enabled } = useVoice();
  if (!enabled) return null;
  return (
    <Panel title={`Ведущий · ${name}`}>
      <ParticipantVideo playerId={id} name={name} />
    </Panel>
  );
};

interface FinalPanelProps {
  view: RoomView;
  game: GameView;
  onBackToLobby?: () => void;
}

const FinalPanel = ({ view, game, onBackToLobby }: FinalPanelProps) => {
  const participants = view.players.filter((p) => p.role === "PLAYER");
  const survivors = participants.filter((p) => p.isAlive && !p.hasLeft);
  const outside = participants.filter((p) => !p.isAlive || p.hasLeft);
  const iSurvived = survivors.some((p) => p.id === view.meId);

  return (
    <Panel accent className={styles.final}>
      <ShieldCheck size={40} className={styles.finalIcon} aria-hidden />
      <h2 className={styles.finalTitle}>
        {roomStore.isModerator ? "Игра окончена" : iSurvived ? "Вы в бункере!" : "Вы остались снаружи"}
      </h2>
      <p className="text-secondary">
        {game.catastrophe.title}. Выжившим предстоит провести в бункере {game.catastrophe.stay}.
      </p>
      <div className={styles.finalLists}>
        <div>
          <h3>В бункере</h3>
          <p>{survivors.map((p) => p.name).join(", ") || "никого"}</p>
        </div>
        <div>
          <h3>Снаружи</h3>
          <p className="text-secondary">{outside.map((p) => p.name).join(", ") || "никого"}</p>
        </div>
      </div>
      <p className="text-muted text-sm">Карты всех игроков открыты — обсудите, кто был прав.</p>
      {onBackToLobby ? (
        <Button variant="primary" icon={<DoorOpen size={18} />} onClick={onBackToLobby}>
          Новая игра с этой компанией
        </Button>
      ) : (
        <p className="text-muted text-sm">Хост может вернуть всех в лобби для новой игры.</p>
      )}
    </Panel>
  );
};
