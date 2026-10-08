import { useState } from "react";
import {
  StartAudio,
  useConnectionState,
  useLocalParticipant,
  useLocalParticipantPermissions,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Ear, Mic, MicOff, Settings, Video, VideoOff } from "lucide-react";

import { Badge, Button, Select } from "../components/ui";
import { useVoice } from "./voiceContext";
import styles from "./voice.module.css";

/** Mic / camera toggles and device selection for the header. */
export const MediaControls = () => {
  const { enabled, error } = useVoice();
  if (!enabled) {
    return error ? (
      <Badge tone="neutral" icon={<MicOff size={12} />}>
        голос недоступен
      </Badge>
    ) : null;
  }
  return <LiveControls />;
};

const LiveControls = () => {
  const state = useConnectionState();
  const permissions = useLocalParticipantPermissions();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, lastMicrophoneError, lastCameraError } =
    useLocalParticipant();
  const [busy, setBusy] = useState(false);
  const [showDevices, setShowDevices] = useState(false);

  if (state !== ConnectionState.Connected) {
    return (
      <Badge tone={state === ConnectionState.Disconnected ? "danger" : "neutral"}>
        {state === ConnectionState.Disconnected ? "голос отключён" : "подключение голоса…"}
      </Badge>
    );
  }

  const toggle = async (kind: "mic" | "camera") => {
    setBusy(true);
    try {
      if (kind === "mic") await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      else await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      // Permission denied etc. — shown via lastMicrophoneError / lastCameraError.
    } finally {
      setBusy(false);
    }
  };

  const mediaError = lastMicrophoneError ?? lastCameraError;

  return (
    <div className={styles.controls}>
      <StartAudio label="Включить звук" className={styles.startAudio} />

      {permissions && !permissions.canPublish ? (
        <Badge icon={<Ear size={12} />}>только слушаете</Badge>
      ) : (
        <>
          <Button
            size="sm"
            variant={isMicrophoneEnabled ? "success" : "ghost"}
            icon={isMicrophoneEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            disabled={busy}
            onClick={() => void toggle("mic")}
            aria-pressed={isMicrophoneEnabled}
            title={isMicrophoneEnabled ? "Выключить микрофон" : "Включить микрофон"}
          >
            <span className={styles.controlLabel}>Микрофон</span>
          </Button>
          <Button
            size="sm"
            variant={isCameraEnabled ? "success" : "ghost"}
            icon={isCameraEnabled ? <Video size={14} /> : <VideoOff size={14} />}
            disabled={busy}
            onClick={() => void toggle("camera")}
            aria-pressed={isCameraEnabled}
            title={isCameraEnabled ? "Выключить камеру" : "Включить камеру"}
          >
            <span className={styles.controlLabel}>Камера</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Settings size={14} />}
            onClick={() => setShowDevices((v) => !v)}
            aria-expanded={showDevices}
            aria-label="Устройства"
            title="Устройства"
          />
        </>
      )}

      {mediaError && (
        <Badge tone="danger">
          {mediaError.name === "NotAllowedError" ? "нет доступа к устройству" : "ошибка устройства"}
        </Badge>
      )}

      {showDevices && (
        <div className={styles.devices}>
          <DeviceSelect kind="audioinput" label="Микрофон" />
          <DeviceSelect kind="videoinput" label="Камера" />
          <DeviceSelect kind="audiooutput" label="Динамики" />
        </div>
      )}
    </div>
  );
};

const DeviceSelect = ({ kind, label }: { kind: MediaDeviceKind; label: string }) => {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });
  if (devices.length === 0) return null;

  return (
    <Select
      aria-label={label}
      value={activeDeviceId}
      onChange={(e) => void setActiveMediaDevice(e.target.value)}
    >
      {devices.map((device, i) => (
        <option key={device.deviceId || i} value={device.deviceId}>
          {device.label || `${label} ${i + 1}`}
        </option>
      ))}
    </Select>
  );
};
