import type { PublicPlayer } from "../api/types";
import { MicIndicator, ParticipantMedia } from "./ParticipantMedia";
import { useVoice } from "./voiceContext";
import styles from "./voice.module.css";

/** Camera grid for the lobby. */
export const VideoStrip = ({ players, canMute }: { players: PublicPlayer[]; canMute: boolean }) => {
  const { enabled } = useVoice();
  if (!enabled) return null;

  return (
    <div className={styles.strip}>
      {players.map((player) => (
        <div key={player.id} className={styles.stripTile}>
          <ParticipantMedia playerId={player.id} name={player.name} />
          <span className={styles.stripName}>
            {player.name}
            <MicIndicator playerId={player.id} canMute={canMute} />
          </span>
        </div>
      ))}
    </div>
  );
};
