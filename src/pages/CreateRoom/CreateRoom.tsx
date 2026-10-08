import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { applySettingsPatch } from "../../api/settings";
import { DEFAULT_SETTINGS, NAME_MAX_LENGTH } from "../../api/types";
import { SettingsForm } from "../../components/SettingsForm";
import { Alert, Button, Field, Input, Page, Panel } from "../../components/ui";
import { useAction } from "../../hooks/useAction";
import { roomStore } from "../../store/roomStore";
import { loadName, saveName } from "../../store/storage";
import styles from "./CreateRoom.module.css";

export const CreateRoom = observer(() => {
  const navigate = useNavigate();
  const { run, pending, error, setError } = useAction();

  const [name, setName] = useState(loadName);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const create = () =>
    run(async () => {
      const code = await roomStore.create(name.trim(), settings);
      navigate(`/room/${code}`, { replace: true });
    });

  return (
    <Page className={styles.page}>
      <Link to="/" className={styles.back}>
        <ArrowLeft size={16} />
        К списку комнат
      </Link>

      <Panel accent title="Новая комната" icon={<Plus size={18} />}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <Field label="Позывной" hint="Вы станете хостом комнаты">
            <Input
              placeholder="Например, Меченый"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                saveName(e.target.value.trim());
              }}
              autoFocus={!name}
            />
          </Field>

          <SettingsForm
            value={settings}
            titlePlaceholder={`Комната ${name.trim() || "игрока"}`}
            onChange={(patch) => setSettings((s) => applySettingsPatch(s, patch))}
          />

          {error && <Alert onClose={() => setError(null)}>{error}</Alert>}

          <Button type="submit" variant="primary" block loading={pending} disabled={!roomStore.connected}>
            Создать комнату
          </Button>
        </form>
      </Panel>
    </Page>
  );
});
