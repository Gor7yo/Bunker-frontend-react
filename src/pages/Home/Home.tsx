import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, WifiOff, DoorOpen, Plus, Loader2 } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import styles from "./Home.module.css";
import { ReconnectBtn } from "../../components/ReconnectBtn/ReconnectBtn";
import { gameStore } from "../../store/gameStore";

export const Home = observer(() => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

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

      const currentName = playerName.trim() || gameStore.playerName || "Player";

      gameStore.setRoomCode(data.roomCode);
      gameStore.setPlayerName(currentName);
      gameStore.setIsHost(true);

      if (data.host) {
        gameStore.setPlayers([data.host]);
      }

      navigate(`/room/${data.roomCode}`);
    };

    const onJoined = (data: any) => {
      const currentName = playerName.trim() || gameStore.playerName || "Player";

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

  useEffect(() => {
    gameStore.clearStorage();
  }, []);

  const handleCreateRoom = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setError("Enter your name");
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
      setError("Enter your name");
      return;
    }

    if (!trimmedCode) {
      setError("Enter room code");
      return;
    }

    gameStore.setPlayerName(trimmedName);
    setError("");

    socket?.emit("room:join", {
      roomCode: trimmedCode,
      playerName: trimmedName,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bunker</h1>
        <p className={styles.subtitle}>Survive in the world of stalkers</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Your name"
            value={playerName}
            onChange={(e) => updatePlayerName(e.target.value)}
          />

          <div className={styles.joinRow}>
            <input
              className={styles.inputSmall}
              placeholder="Room code"
              value={roomCode}
              maxLength={6}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />

            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleJoinRoom}
            >
              <DoorOpen size={18} />
              <span>Join</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isCreating || !isConnected}
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleCreateRoom}
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create room</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.status}>
          {isConnected ? (
            <>
              <Wifi size={14} />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Connecting...</span>
            </>
          )}
        </div>

        {/* {gameStore.roomCode && gameStore.playerName && (
          <ReconnectBtn roomCode={gameStore.roomCode} />
        )} */}
      </div>
    </div>
  );
});
