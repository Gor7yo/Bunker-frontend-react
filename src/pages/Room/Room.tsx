import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DoorOpen } from "lucide-react";

import { NAME_MAX_LENGTH } from "../../api/types";
import { Alert, Button, Field, Input, Page, Panel, Spinner } from "../../components/ui";
import { useAction } from "../../hooks/useAction";
import { roomStore } from "../../store/roomStore";
import { loadName } from "../../store/storage";
import { GameScreen } from "../GameScreen/GameScreen";
import { Lobby } from "../Lobby/Lobby";
import { VoiceRoom } from "../../voice/VoiceRoom";

/** /room/:code — lobby or game for members, a join form for invite links. */
export const Room = observer(() => {
  const code = (useParams().code ?? "").toUpperCase();
  const { view, resuming, connected } = roomStore;

  if (view?.code === code) {
    // VoiceRoom stays mounted across lobby → game, so voice doesn't reconnect.
    return (
      <VoiceRoom code={code}>
        {view.status === "LOBBY" ? <Lobby view={view} /> : <GameScreen view={view} />}
      </VoiceRoom>
    );
  }

  if (resuming || !connected) {
    return (
      <Page centered>
        <Spinner size={32} label="Подключение" />
      </Page>
    );
  }

  return <JoinByLink code={code} />;
});

const JoinByLink = ({ code }: { code: string }) => {
  const navigate = useNavigate();
  const { run, pending, error } = useAction();
  const [name, setName] = useState(loadName);

  const join = () =>
    run(async () => {
      await roomStore.join(code, name);
      navigate(`/room/${code}`, { replace: true });
    });

  return (
    <Page centered narrow>
      <Panel accent title={`Комната ${code}`}>
        <form
          style={{ display: "contents" }}
          onSubmit={(e) => {
            e.preventDefault();
            void join();
          }}
        >
          {error && <Alert>{error}</Alert>}
          <Field label="Позывной">
            <Input
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>
          <Button type="submit" variant="primary" block loading={pending} icon={<DoorOpen size={18} />}>
            Войти в комнату
          </Button>
        </form>
        <Link to="/" className="text-sm">
          ← На главную
        </Link>
      </Panel>
    </Page>
  );
};
