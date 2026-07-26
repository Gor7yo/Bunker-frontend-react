import { useState } from 'react';
import styles from './HostPanel.module.css';

interface IPlayer {
  id: string;
  name: string;
  isAlive: boolean;
}

interface HostPanelProps {
  players: IPlayer[];
  onRevealCard: (playerId: string) => void;
}

export const HostPanel = ({ players, onRevealCard }: HostPanelProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handleReveal = () => {
    if (selectedPlayer) {
      onRevealCard(selectedPlayer);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🎮 Панель ведущего</h3>
      
      <div className={styles.players}>
        {players.map((player) => (
          <button
            key={player.id}
            className={`${styles.playerBtn} ${selectedPlayer === player.id ? styles.selected : ''}`}
            onClick={() => setSelectedPlayer(player.id)}
            disabled={!player.isAlive}
          >
            {player.name} {!player.isAlive && '💀'}
          </button>
        ))}
      </div>

      <button
        className={styles.revealBtn}
        onClick={handleReveal}
        disabled={!selectedPlayer}
      >
        🃏 Открыть карту
      </button>

      <p className={styles.hint}>Выберите игрока и нажмите "Открыть карту"</p>
    </div>
  );
};