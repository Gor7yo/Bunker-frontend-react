import {
  useIsMuted,
  useIsSpeaking,
  useParticipants,
  useParticipantTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";
import { MicOff, VolumeX } from "lucide-react";

import { request } from "../api/socket";
import { cx } from "../components/ui";
import { useVoice } from "./voiceContext";
import styles from "./voice.module.css";

interface MediaProps {
  /** Player id = LiveKit participant identity. */
  playerId: string;
  name: string;
}

/** Fills its parent: the player's camera, or initials when there is none. */
export const ParticipantMedia = (props: MediaProps) => {
  const { enabled } = useVoice();
  // LiveKit hooks need the room context — without voice show initials only.
  return enabled ? <LiveMedia {...props} /> : <Initials name={props.name} />;
};

const Initials = ({ name }: { name: string }) => (
  <span className={styles.initials} aria-hidden>
    {name.slice(0, 2).toUpperCase()}
  </span>
);

const LiveMedia = ({ playerId, name }: MediaProps) => {
  const participant = useParticipants().find((p) => p.identity === playerId);
  const [camera] = useParticipantTracks([Track.Source.Camera], playerId);
  const hasVideo = camera && !camera.publication.isMuted;

  return (
    <>
      {hasVideo ? (
        <VideoTrack
          trackRef={camera}
          className={cx(styles.videoEl, participant?.isLocal && styles.mirrored)}
        />
      ) : (
        <Initials name={name} />
      )}
      {participant && <SpeakingRing participant={participant} />}
    </>
  );
};

const SpeakingRing = ({ participant }: { participant: Participant }) => {
  const speaking = useIsSpeaking(participant);
  return <span className={cx(styles.speakingRing, speaking && styles.speaking)} aria-hidden />;
};

/** Mic state next to the name; a mute button for the moderator. */
export const MicIndicator = ({ playerId, canMute }: { playerId: string; canMute?: boolean }) => {
  const { enabled } = useVoice();
  return enabled ? <LiveMicIndicator playerId={playerId} canMute={canMute} /> : null;
};

const LiveMicIndicator = ({ playerId, canMute }: { playerId: string; canMute?: boolean }) => {
  const participant = useParticipants().find((p) => p.identity === playerId);
  if (!participant) {
    return (
      <span className={styles.offAir} title="Не подключён к голосу">
        не в эфире
      </span>
    );
  }
  return <MicState participant={participant} playerId={playerId} canMute={canMute} />;
};

const MicState = ({
  participant,
  playerId,
  canMute,
}: {
  participant: Participant;
  playerId: string;
  canMute?: boolean;
}) => {
  const micMuted = useIsMuted({ participant, source: Track.Source.Microphone });

  if (micMuted) {
    return (
      <span className={styles.micOff} title="Микрофон выключен" aria-label="Микрофон выключен">
        <MicOff size={12} />
      </span>
    );
  }
  if (!canMute || participant.isLocal) return null;

  return (
    <button
      type="button"
      className={styles.muteButton}
      title="Выключить микрофон игроку"
      aria-label="Выключить микрофон игроку"
      onClick={(e) => {
        e.stopPropagation();
        void request("voice:mute", { playerId }).catch(() => undefined);
      }}
    >
      <VolumeX size={12} />
    </button>
  );
};
