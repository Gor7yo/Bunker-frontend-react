import styles from './PlayerList.module.css';

interface IPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isAlive: boolean;
}

interface PlayerListProps {
  players: IPlayer[];
  isHost: boolean;
  gameState: string;
}

export const PlayerList = ({ players, isHost, gameState }: PlayerListProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>👥 Игроки</span>
        <span className={styles.count}>{players.length}/12</span>
      </div>
      <div className={styles.list}>
        {players.map((player) => (
          <div key={player.id} className={styles.playerItem}>
            <div className={styles.playerInfo}>
              <span className={styles.name}>
                {player.isHost && '👑 '}
                {player.name}
              </span>
              {gameState === 'WAITING' && (
                <span className={player.isReady ? styles.ready : styles.notReady}>
                  {player.isReady ? '✅ Готов' : '⏳ Ожидает'}
                </span>
              )}
              {gameState === 'GAME_RUNNING' && (
                <span className={player.isAlive ? styles.alive : styles.dead}>
                  {player.isAlive ? '❤️ Жив' : '💀 Мёртв'}
                </span>
              )}
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