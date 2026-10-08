import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  StartAudio,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useLocalParticipantPermissions,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Ear, Loader2, Mic, MicOff, Settings, Video, VideoOff, Volume2, VolumeX } from "lucide-react";

import { Select, cx, useTooltip } from "../components/ui";
import { sfx } from "../sound/sfx";
import { useSoundEnabled } from "../sound/useGameSounds";
import { toastStore } from "../store/toastStore";
import { useVoice } from "./voiceContext";
import styles from "./MediaDock.module.css";

/**
 * Floating panel in the bottom-right corner: microphone and camera
 * (green — on, red — off), devices and game sounds. Hotkeys: M, V.
 */
export const MediaDock = () => {
  const { enabled, error } = useVoice();

  return (
    <div className={styles.dock} role="toolbar" aria-label="Связь">
      {enabled ? <LiveControls /> : <OfflineControls error={error} />}
      <SoundButton />
    </div>
  );
};

const OfflineControls = ({ error }: { error: string | null }) => (
  <DockButton state="off" disabled tooltip={error ?? "Подключение к голосу…"} label="Голос недоступен">
    {error ? <MicOff /> : <Loader2 className={styles.spin} />}
  </DockButton>
);

const LiveControls = () => {
  const state = useConnectionState();
  const permissions = useLocalParticipantPermissions();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const speaking = useIsSpeaking(localParticipant);
  const [busy, setBusy] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);

  const connected = state === ConnectionState.Connected;
  const canPublish = permissions?.canPublish !== false;

  const toggle = async (kind: "mic" | "camera") => {
    if (!connected || !canPublish || busy) return;
    setBusy(true);
    try {
      if (kind === "mic") await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      else await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (e) {
      const denied = e instanceof Error && e.name === "NotAllowedError";
      toastStore.error(
        denied
          ? "Браузер не дал доступ к устройству — разрешите его в настройках сайта"
          : "Не удалось включить устройство",
      );
    } finally {
      setBusy(false);
    }
  };

  // Hotkeys M / V, unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.ctrlKey || e.metaKey || e.altKey || el.closest("input, textarea, select, [contenteditable]")) return;
      if (e.code === "KeyM") void toggle("mic");
      if (e.code === "KeyV") void toggle("camera");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!connected) {
    return (
      <DockButton state="off" disabled tooltip="Подключение к голосу…" label="Подключение">
        <Loader2 className={styles.spin} />
      </DockButton>
    );
  }

  if (!canPublish) {
    return (
      <DockButton state="muted" disabled tooltip="Сейчас вы можете только слушать" label="Только слушаете">
        <Ear />
      </DockButton>
    );
  }

  return (
    <>
      <StartAudio label="Включить звук собеседников" className={styles.startAudio} />
      <DockButton
        state={isMicrophoneEnabled ? "on" : "off"}
        speaking={isMicrophoneEnabled && speaking}
        disabled={busy}
        pressed={isMicrophoneEnabled}
        tooltip={isMicrophoneEnabled ? "Выключить микрофон (M)" : "Включить микрофон (M)"}
        label="Микрофон"
        onClick={() => void toggle("mic")}
      >
        {isMicrophoneEnabled ? <Mic /> : <MicOff />}
      </DockButton>
      <DockButton
        state={isCameraEnabled ? "on" : "off"}
        disabled={busy}
        pressed={isCameraEnabled}
        tooltip={isCameraEnabled ? "Выключить камеру (V)" : "Включить камеру (V)"}
        label="Камера"
        onClick={() => void toggle("camera")}
      >
        {isCameraEnabled ? <Video /> : <VideoOff />}
      </DockButton>
      <div className={styles.devicesWrap}>
        <DockButton
          state="neutral"
          small
          pressed={devicesOpen}
          tooltip={devicesOpen ? null : "Микрофон, камера, динамики"}
          label="Устройства"
          onClick={() => setDevicesOpen((v) => !v)}
        >
          <Settings />
        </DockButton>
        {devicesOpen && <DevicesMenu onClose={() => setDevicesOpen(false)} />}
      </div>
    </>
  );
};

const SoundButton = () => {
  const on = useSoundEnabled();
  return (
    <DockButton
      state="neutral"
      small
      pressed={on}
      tooltip={on ? "Выключить звуки игры" : "Включить звуки игры"}
      label="Звуки игры"
      onClick={() => sfx.setEnabled(!on)}
    >
      {on ? <Volume2 /> : <VolumeX />}
    </DockButton>
  );
};

interface DockButtonProps {
  state: "on" | "off" | "muted" | "neutral";
  tooltip: string | null;
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  speaking?: boolean;
  small?: boolean;
}

const DockButton = ({ state, tooltip, label, children, onClick, disabled, pressed, speaking, small }: DockButtonProps) => {
  const { anchorProps, tooltip: tip } = useTooltip<HTMLSpanElement>(tooltip);
  // The anchor wraps the button so the hint also shows when it's disabled;
  // the button itself handles clicks and focus.
  const { ref, onMouseEnter, onMouseLeave } = anchorProps as Partial<typeof anchorProps>;

  return (
    <span ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={styles.anchor}>
      <button
        type="button"
        className={cx(styles.button, styles[state], small && styles.small, speaking && styles.speaking)}
        disabled={disabled}
        aria-pressed={pressed}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </button>
      {tip}
    </span>
  );
};

const DevicesMenu = ({ onClose }: { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className={styles.devices} role="dialog" aria-label="Устройства">
      <DeviceSelect kind="audioinput" label="Микрофон" />
      <DeviceSelect kind="videoinput" label="Камера" />
      <DeviceSelect kind="audiooutput" label="Динамики" />
    </div>
  );
};

const DeviceSelect = ({ kind, label }: { kind: MediaDeviceKind; label: string }) => {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });
  if (devices.length === 0) return null;

  return (
    <label className={styles.deviceField}>
      <span>{label}</span>
      <Select value={activeDeviceId} onChange={(e) => void setActiveMediaDevice(e.target.value)}>
        {devices.map((device, i) => (
          <option key={device.deviceId || i} value={device.deviceId}>
            {device.label || `${label} ${i + 1}`}
          </option>
        ))}
      </Select>
    </label>
  );
};
