import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import styles from "./Home.module.css";
import { ReconnectBtn } from "../../components/ReconnectBtn/ReconnectBtn";
import { gameStore } from "../../store/gameStore";

export const Home = observer(() => {
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState(gameStore.playerName || "");
  const [roomCode, setRoomCode] = useState(gameStore.roomCode || "");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const updatePlayerName = (name: string) => {
    setPlayerName(name);
    gameStore.setPlayerName(name);
  };

  useEffect(() => {
    if (!socket) return;

    const onCreated = (data: any) => {
      setIsCreating(false);

      const currentName = playerName.trim() || gameStore.playerName || "Игрок";

      gameStore.setRoomCode(data.roomCode);
      gameStore.setPlayerName(currentName);
      gameStore.setIsHost(true);

      if (data.host) {
        gameStore.setPlayers([data.host]);
      }

      navigate(`/room/${data.roomCode}`);
    };

    const onJoined = (data: any) => {
      const currentName = playerName.trim() || gameStore.playerName || "Игрок";

      gameStore.setRoomCode(data.roomCode);
      gameStore.setPlayerName(currentName);
      gameStore.setIsHost(data.player?.isHost ?? false);
      gameStore.setPlayers(data.players);
      gameStore.setGameState(data.gameState);

      navigate(`/room/${data.roomCode}`);
    };

    const onError = (data: any) => {
      setIsCreating(false);
      setError(data.message);
    };

    socket.on("room:created", onCreated);
    socket.on("room:joined", onJoined);
    socket.on("room:error", onError);

    return () => {
      socket.off("room:created", onCreated);
      socket.off("room:joined", onJoined);
      socket.off("room:error", onError);
    };
  }, [socket, navigate, playerName]);

  const handleCreateRoom = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setError("Введите имя");
      return;
    }

    gameStore.setPlayerName(trimmedName);
    setError("");
    setIsCreating(true);

    socket?.emit("room:create", {
      hostName: trimmedName,
    });
  };

  const handleJoinRoom = () => {
    const trimmedName = playerName.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      setError("Введите имя");
      return;
    }

    if (!trimmedCode) {
      setError("Введите код комнаты");
      return;
    }

    gameStore.setPlayerName(trimmedName);
    setError("");

    socket?.emit("room:join", {
      roomCode: trimmedCode,
      player: {
        name: trimmedName,
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🏚️ Бункер</h1>
        <p className={styles.subtitle}>Выживи в мире сталкеров</p>

        {error && <div className={styles.error}>{error}</div>}

        {gameStore.roomCode && gameStore.playerName && (
          <ReconnectBtn
            roomCode={gameStore.roomCode}
          />
        )}

        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Ваше имя"
            value={playerName}
            onChange={(e) => updatePlayerName(e.target.value)}
          />

          <div className={styles.divider}>или</div>

          <div className={styles.joinRow}>
            <input
              className={styles.inputSmall}
              placeholder="Код комнаты"
              value={roomCode}
              maxLength={6}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />

            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleJoinRoom}
            >
              Войти
            </button>
          </div>

          <button
            disabled={isCreating}
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleCreateRoom}
          >
            {isCreating ? "Создание..." : "🚀 Создать комнату"}
          </button>
        </div>

        <div className={styles.status}>
          {isConnected ? "✅ Подключено" : "⏳ Подключение..."}
        </div>
      </div>
    </div>
  );
});
