import styles from "./PlayerList.module.css";

interface IPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isAlive: boolean;
  isOnline: boolean;
  socketId: string;
}

interface PlayerListProps {
  players: IPlayer[];
  isHost: boolean;
  onKick: (playerName: string) => void;
}

export const PlayerList = ({ players, isHost, onKick }: PlayerListProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>👥 Игроки</span>
        <span className={styles.count}>{players.length}/12</span>
      </div>

      <div className={styles.list}>
        {players.map((player) => (
          <div
            key={player.id}
            className={`${styles.playerItem} ${!player.isOnline && styles.isOffline}`}
          >
            <div className={styles.playerInfo}>
              <div className={styles.nameBlock}>
                {isHost && !player.isHost && (
                  <button
                    type="button"
                    className={styles.kickButton}
                    onClick={() => onKick(player.name)}
                    title={`Кикнуть ${player.name}`}
                    aria-label={`Кикнуть ${player.name}`}
                  >
                    <span>✕</span>
                  </button>
                )}

                <span className={styles.name}>
                  {player.isHost && "👑 "}
                  {player.name}
                </span>
              </div>

              <div className={styles.playerActions}>
                <span
                  className={player.isReady ? styles.ready : styles.notReady}
                >
                  {player.isOnline
                    ? player.isReady
                      ? "✅ Ready"
                      : "⏳ Waiting"
                    : "Offline"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className={styles.empty}>Нет игроков</div>
        )}
      </div>
    </div>
  );
};
