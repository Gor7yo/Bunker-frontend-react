import { observer } from "mobx-react-lite";
import { useEffect, useState, type ReactNode } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { VideoPresets, type RoomOptions } from "livekit-client";

import { request } from "../api/socket";
import { roomStore } from "../store/roomStore";
import { VoiceContext } from "./voiceContext";

/**
 * Low-latency defaults: the camera is captured at 360p and sent in several
 * qualities (simulcast); each viewer receives only the quality that fits
 * the tile size (adaptiveStream) and unused layers are not sent (dynacast).
 */
const ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { resolution: VideoPresets.h360.resolution },
  publishDefaults: {
    simulcast: true,
    videoSimulcastLayers: [VideoPresets.h90, VideoPresets.h180],
    dtx: true,
    red: true,
  },
  audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
};

type Credentials = { code: string; url: string; token: string } | { code: string; error: string };

/** Connects to the room's LiveKit room while the player is in it. */
export const VoiceRoom = observer(({ code, children }: { code: string; children: ReactNode }) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const { connected } = roomStore;
  const hasToken = credentials?.code === code && "token" in credentials;

  useEffect(() => {
    if (!connected || hasToken) return;
    let cancelled = false;

    request<{ url: string; token: string }>("voice:token")
      .then((data) => !cancelled && setCredentials({ code, ...data }))
      .catch((e: unknown) => {
        if (cancelled) return;
        setCredentials({ code, error: e instanceof Error ? e.message : "Голосовой чат недоступен" });
      });

    return () => {
      cancelled = true;
    };
  }, [code, connected, hasToken]);

  if (!credentials || credentials.code !== code || "error" in credentials) {
    const error = credentials && "error" in credentials ? credentials.error : null;
    return <VoiceContext.Provider value={{ enabled: false, error }}>{children}</VoiceContext.Provider>;
  }

  return (
    <LiveKitRoom
      serverUrl={credentials.url}
      token={credentials.token}
      connect
      audio={false}
      video={false}
      options={ROOM_OPTIONS}
      onError={(e) => console.warn("LiveKit:", e)}
      style={{ display: "contents" }}
    >
      <VoiceContext.Provider value={{ enabled: true, error: null }}>
        <RoomAudioRenderer />
        {children}
      </VoiceContext.Provider>
    </LiveKitRoom>
  );
});
