import type { PublicPlayer } from "../api/types";
import { ParticipantVideo } from "./ParticipantVideo";
import { useVoice } from "./voiceContext";
import styles from "./voice.module.css";

/** Small camera grid for the lobby. */
export const VideoStrip = ({ players, canMute }: { players: PublicPlayer[]; canMute: boolean }) => {
  const { enabled } = useVoice();
  if (!enabled) return null;

  return (
    <div className={styles.strip}>
      {players.map((player) => (
        <div key={player.id} className={styles.stripItem}>
          <ParticipantVideo playerId={player.id} name={player.name} size="sm" canMute={canMute} />
          <span>{player.name}</span>
        </div>
      ))}
    </div>
  );
};
