import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Gavel, IdCard, LogOut } from "lucide-react";

import type { CardKey, RoomView } from "../../api/types";
import { CardView } from "../../components/CardView";
import { Alert, Badge, Button, Page, Panel, cx } from "../../components/ui";
import { useAction } from "../../hooks/useAction";
import { roomStore } from "../../store/roomStore";
import styles from "./GameScreen.module.css";

// Temporary game screen: the full table (phases, voting, moderator panel)
// comes with the game engine.
export const GameScreen = observer(({ view }: { view: RoomView }) => {
  const navigate = useNavigate();
  const { run, error, setError } = useAction();
  const { isModerator } = roomStore;

  const leave = () => {
    if (!confirm("Покинуть игру? Вернуться в неё будет нельзя.")) return;
    void run(async () => {
      await roomStore.leave();
      navigate("/");
    });
  };

  return (
    <Page>
      <Panel accent className={styles.header}>
        <h1 className={styles.title}>{view.settings.title}</h1>
        <Button variant="danger" size="sm" icon={<LogOut size={14} />} onClick={leave}>
          Покинуть игру
        </Button>
      </Panel>

      {error && <Alert onClose={() => setError(null)}>{error}</Alert>}

      {isModerator && (
        <Alert tone="info">
          <Gavel size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Вы ведущий — вам видны все карты.
        </Alert>
      )}

      {view.myCard && (
        <Panel title="Ваша карта" icon={<IdCard size={18} />}>
          <CardView card={view.myCard} revealed={view.myRevealed} />
        </Panel>
      )}

      <div className={styles.players}>
        {view.players
          .filter((p) => p.role === "PLAYER" && p.id !== view.meId)
          .map((p) => (
            <Panel
              key={p.id}
              title={p.name}
              actions={p.hasLeft && <Badge tone="danger">покинул игру</Badge>}
              className={cx(p.hasLeft && styles.left)}
            >
              <CardView card={p.card ?? p.revealed} revealed={Object.keys(p.revealed) as CardKey[]} showHidden />
            </Panel>
          ))}
      </div>
    </Page>
  );
});
