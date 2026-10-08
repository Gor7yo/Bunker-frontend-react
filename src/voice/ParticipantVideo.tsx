import { useIsMuted, useIsSpeaking, useParticipants, useParticipantTracks, VideoTrack } from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";
import { MicOff, VolumeX } from "lucide-react";

import { request } from "../api/socket";
import { cx } from "../components/ui";
import { useVoice } from "./voiceContext";
import styles from "./voice.module.css";

interface Props {
  /** Player id = LiveKit participant identity. */
  playerId: string;
  name: string;
  /** Show a "mute" button (moderator, host in the lobby). */
  canMute?: boolean;
  size?: "sm" | "md";
}

/** Camera of a player, or their initials when the camera is off. */
export const ParticipantVideo = (props: Props) => {
  const { enabled } = useVoice();
  // Voice hooks need the LiveKit room context.
  return enabled ? <LiveVideo {...props} /> : null;
};

const LiveVideo = ({ playerId, name, canMute, size = "md" }: Props) => {
  const participant = useParticipants().find((p) => p.identity === playerId);
  const [camera] = useParticipantTracks([Track.Source.Camera], playerId);
  const hasVideo = camera && !camera.publication.isMuted;

  return (
    <div className={cx(styles.video, styles[size])}>
      {hasVideo ? (
        <VideoTrack trackRef={camera} className={styles.videoEl} />
      ) : (
        <span className={styles.initials} aria-hidden>
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {participant ? (
        <ParticipantState participant={participant} playerId={playerId} canMute={canMute} />
      ) : (
        <span className={styles.offAir}>не в эфире</span>
      )}
    </div>
  );
};

const ParticipantState = ({
  participant,
  playerId,
  canMute,
}: {
  participant: Participant;
  playerId: string;
  canMute?: boolean;
}) => {
  const speaking = useIsSpeaking(participant);
  const micMuted = useIsMuted({ participant, source: Track.Source.Microphone });

  return (
    <>
      <span className={cx(styles.speakingRing, speaking && styles.speaking)} aria-hidden />
      {micMuted && (
        <span className={styles.micState} title="Микрофон выключен">
          <MicOff size={12} />
        </span>
      )}
      {canMute && !micMuted && !participant.isLocal && (
        <button
          type="button"
          className={styles.muteButton}
          title="Выключить микрофон игроку"
          aria-label="Выключить микрофон игроку"
          onClick={() => void request("voice:mute", { playerId }).catch(() => undefined)}
        >
          <VolumeX size={12} />
        </button>
      )}
    </>
  );
};
