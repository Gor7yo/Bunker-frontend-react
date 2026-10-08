import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, DoorOpen, Gavel, KeyRound, Plus, Radiation, Undo2, Users } from "lucide-react";

import {
  DEFAULT_SETTINGS,
  NAME_MAX_LENGTH,
  type PublicRoomSummary,
  type RoomSettings,
  type SettingsPatch,
} from "../../api/types";
import { SettingsForm } from "../../components/SettingsForm";
import { Alert, Badge, Button, Field, Input, Page, Panel, Spinner } from "../../components/ui";
import { useAction } from "../../hooks/useAction";
import { publicRoomsStore } from "../../store/publicRoomsStore";
import { roomStore } from "../../store/roomStore";
import { loadName } from "../../store/storage";
import styles from "./Home.module.css";

const applyPatch = (base: RoomSettings, patch: SettingsPatch): RoomSettings => ({
  ...base,
  ...patch,
  timers: { ...base.timers, ...patch.timers },
});

export const Home = observer(() => {
  const navigate = useNavigate();
  const { run, pending, error, setError } = useAction();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(loadName);
  const [code, setCode] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { view, connected, notice } = roomStore;

  useEffect(() => publicRoomsStore.watch(), []);

  /** Runs an action that needs a name; focuses the name field if it's empty. */
  const withName = (action: (name: string) => Promise<string>) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Сначала введите позывной");
      nameRef.current?.focus();
      return;
    }
    void run(async () => navigate(`/room/${await action(trimmed)}`));
  };

  const joinRoom = (roomCode: string) => withName((n) => roomStore.join(roomCode, n));
  const createRoom = () => withName((n) => roomStore.create(n, settings));

  return (
    <Page>
      <header className={styles.hero}>
        <Radiation size={40} className={styles.logoIcon} aria-hidden />
        <div>
          <h1 className={styles.logo}>Бункер</h1>
          <p className={styles.tagline}>Зона не прощает ошибок. Убеди остальных, что ты нужен в бункере.</p>
        </div>
      </header>

      {notice && (
        <Alert tone="info" onClose={roomStore.dismissNotice}>
          {notice}
        </Alert>
      )}

      {view && (
        <Button variant="success" block icon={<Undo2 size={18} />} onClick={() => navigate(`/room/${view.code}`)}>
          Вернуться в комнату {view.code}
        </Button>
      )}

      <Panel accent>
        <Field label="Позывной" hint="Под этим именем вас увидят другие игроки">
          <Input
            ref={nameRef}
            className={styles.nameInput}
            placeholder="Например, Меченый"
            maxLength={NAME_MAX_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        {error && <Alert onClose={() => setError(null)}>{error}</Alert>}
      </Panel>

      <div className={styles.grid}>
        <Panel
          title="Открытые комнаты"
          icon={<Users size={18} />}
          actions={<Badge tone={connected ? "success" : "danger"}>{connected ? "в сети" : "нет связи"}</Badge>}
          className={styles.rooms}
        >
          <PublicRooms disabled={pending || !connected} onJoin={joinRoom} />
        </Panel>

        <div className={styles.side}>
          <Panel title="Приватная комната" icon={<KeyRound size={18} />}>
            <form
              className={styles.codeRow}
              onSubmit={(e) => {
                e.preventDefault();
                joinRoom(code);
              }}
            >
              <Input
                className={styles.codeInput}
                placeholder="КОД"
                aria-label="Код комнаты"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
              />
              <Button type="submit" icon={<DoorOpen size={16} />} disabled={pending || !connected || !code}>
                Войти
              </Button>
            </form>
          </Panel>

          <Panel title="Новая комната" icon={<Plus size={18} />}>
            <SettingsForm
              value={settings}
              titlePlaceholder={`Комната ${name.trim() || "игрока"}`}
              onChange={(patch) => setSettings((s) => applyPatch(s, patch))}
            />
            <Button variant="primary" block loading={pending} disabled={!connected} onClick={createRoom}>
              Создать комнату
            </Button>
          </Panel>
        </div>
      </div>
    </Page>
  );
});

const PublicRooms = observer(({ disabled, onJoin }: { disabled: boolean; onJoin: (code: string) => void }) => {
  const { rooms, loading } = publicRoomsStore;

  if (loading) {
    return (
      <div className={styles.empty}>
        <Spinner />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className={styles.empty}>
        <Radiation size={32} aria-hidden />
        <p>Открытых комнат пока нет.</p>
        <p className="text-muted text-sm">Создайте свою — она появится здесь для всех.</p>
      </div>
    );
  }

  return (
    <ul className={styles.roomList}>
      {rooms.map((room) => (
        <PublicRoomRow key={room.code} room={room} disabled={disabled} onJoin={onJoin} />
      ))}
    </ul>
  );
});

const PublicRoomRow = ({
  room,
  disabled,
  onJoin,
}: {
  room: PublicRoomSummary;
  disabled: boolean;
  onJoin: (code: string) => void;
}) => {
  const isFull = room.players >= room.maxPlayers;

  return (
    <li className={styles.room}>
      <div className={styles.roomInfo}>
        <strong className={styles.roomTitle}>{room.title}</strong>
        <div className={styles.roomMeta}>
          {room.mode === "AUTO" ? (
            <Badge icon={<Bot size={12} />}>авто</Badge>
          ) : (
            <Badge tone="accent" icon={<Gavel size={12} />}>
              с ведущим
            </Badge>
          )}
          <span className="text-muted text-sm">хост: {room.hostName}</span>
        </div>
      </div>

      <div className={styles.roomSlots}>
        <span className="mono">
          {room.players}/{room.maxPlayers}
        </span>
        <span className={styles.slotsBar}>
          <span style={{ width: `${Math.min(100, (room.players / room.maxPlayers) * 100)}%` }} />
        </span>
      </div>

      <Button size="sm" variant={isFull ? "ghost" : "secondary"} disabled={disabled || isFull} onClick={() => onJoin(room.code)}>
        {isFull ? "Мест нет" : "Войти"}
      </Button>
    </li>
  );
};
