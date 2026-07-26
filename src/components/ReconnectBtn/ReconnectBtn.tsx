import { useNavigate } from "react-router-dom";
import styles from "./ReconnectBtn.module.css";
import { useSocket } from "../../hooks/useSocket";
import { useEffect, useState } from "react";
import { gameStore } from "../../store/gameStore";

interface ReconnectProps {
  roomCode: string;
  playerName?: string;
}

export const ReconnectBtn = ({ roomCode, playerName }: ReconnectProps) => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onReconnectSuccess = (data: any) => {
      console.log("✅ Reconnect success:", data);
      setIsReconnecting(false);
      setError(null);

      if (data.players) {
        gameStore.setPlayers(data.players);
      }
      if (data.gameState) {
        gameStore.setGameState(data.gameState);
      }
      if (data.player) {
        gameStore.setIsHost(data.player.isHost);
        gameStore.setMySocketId(data.player.id);
        if (data.player.characters) {
          gameStore.setMyCard(data.player.characters);
        }
      }

      navigate(`/room/${roomCode}`);
    };

    const onReconnectError = (data: any) => {
      console.error("❌ Reconnect error:", data);
      setIsReconnecting(false);
      setError(data.message || "Не удалось восстановить подключение");

      setTimeout(() => {
        gameStore.reset();
        navigate("/");
      }, 2000);
    };

    socket.on("room:reconnectSuccess", onReconnectSuccess);
    socket.on("room:reconnectError", onReconnectError);

    return () => {
      socket.off("room:reconnectSuccess", onReconnectSuccess);
      socket.off("room:reconnectError", onReconnectError);
    };
  }, [socket, roomCode, navigate]);

  const hasSavedData = Boolean(gameStore.roomCode && gameStore.playerName);

  const handleReconnect = () => {
    if (!socket) {
      setError("Нет подключения к серверу");
      return;
    }

    if (!isConnected) {
      setError("Сервер не доступен");
      return;
    }

    const playerNameToUse = playerName || gameStore.playerName;
    if (!playerNameToUse) {
      setError("Не найдено имя игрока");
      return;
    }

    setIsReconnecting(true);
    setError(null);

    socket.emit("room:reconnect", {
      roomCode,
      player: {
        name: playerNameToUse,
      },
    });

    setTimeout(() => {
      if (isReconnecting) {
        setIsReconnecting(false);
        setError("Превышено время ожидания");
      }
    }, 10000);
  };

  if (!hasSavedData) {
    return null;
  }

  return (
    <section className={styles.reconnectBtn}>
      {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

      <button
        disabled={isReconnecting || !isConnected}
        onClick={handleReconnect}
        className={`${styles.context} ${isReconnecting ? styles.loading : ""}`}
      >
        {isReconnecting ? (
          <>
            <span className={styles.spinner} />
            Восстановление...
          </>
        ) : (
          "Восстановить игру"
        )}
      </button>

      {!isConnected && (
        <div className={styles.offlineMessage}>
          🔴 Нет подключения к серверу
        </div>
      )}
    </section>
  );
};
