import { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { useSocket } from "../../hooks/useSocket";
import { gameStore, type IPlayer } from "../../store/gameStore";

import { PlayerList } from "../../components/PlayerList/PlayerList";

import styles from "./Room.module.css";

interface IKickedPlayer {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
  isOnline: boolean;
  roomCode: string;
}

interface PlayerKickedPayload {
  kickedPlayer: IKickedPlayer;
  players: IPlayer[];
}

export const Room = observer(() => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [handleIsReady, setHandleIsReady] = useState(false);

  const store = gameStore;
  const roomCode = store.roomCode;

  useEffect(() => {
    if (!socket || !roomCode || !isConnected) return;

    if (!store.playerName) {
      socket.emit("room:getState", { roomCode });
      return;
    }

    console.log("🔄 Reconnecting player:", {
      socketId: socket.id,
      roomCode,
      playerName: store.playerName,
    });

    socket.emit("room:reconnect", {
      roomCode,
      playerName: store.playerName,
    });
  }, [socket, roomCode, store.playerName, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const onJoined = (data: any) => {
      if (data.players) {
        store.setPlayers(data.players);
      }

      if (data.gameState) {
        store.setGameState(data.gameState);
      }
    };

    const onPlayerJoined = (data: any) => {
      store.setGameState("READY_CHECK");

      if (data.players) {
        store.setPlayers(data.players);
      }
    };

    const onPlayerLeft = (data: any) => {
      if (data.players) {
        store.setPlayers(data.players);

        if (data.players.length === 1) {
          store.setIsHost(true);
        }
      }
    };

    const onReadyUpdated = (data: any) => {
      store.setGameState("READY_CHECK");
      setHandleIsReady(false);

      if (data.players) {
        store.setPlayers(data.players);
      }
    };

    const onPlayerKicked = (data: PlayerKickedPayload) => {
      console.log("🚫 Игрок кикнут", data);

      if (data.kickedPlayer.socketId === socket.id) {
        store.reset();
        store.clearStorage();
        navigate("/");
        return;
      }

      store.setPlayers(data.players);
    };

    const onGameStarted = (data: any) => {
      store.setGameState("GAME_RUNNING");

      if (data.players) {
        store.setPlayers(data.players);
      }

      navigate("/game");
    };

    const onCardReceived = (data: any) => {
      if (data.character) {
        store.setMyCard(data.character);
      }
    };

    const onError = (data: any) => {
      navigate("/");
    };

    const onReconnectError = (data: any) => {
      navigate("/");
    };

    const onPlayerReconnected = (data: any) => {
      console.log("🔄 Player reconnected:", data);

      if (data.player) {
        store.setMySocketId(data.player.socketId);
        store.setIsHost(data.player.isHost);
      }

      if (data.players) {
        store.setPlayers(data.players);
      }
    };

    const onLeft = (data: any) => {
      store.reset();
      store.clearStorage();
      navigate("/");
    };

    socket.on("room:joined", onJoined);
    socket.on("room:playerJoined", onPlayerJoined);
    socket.on("room:playersUpdated", onReadyUpdated);
    socket.on("room:playerReconnected", onPlayerReconnected);
    socket.on("room:left", onLeft);
    socket.on("room:error", onError);
    socket.on("room:reconnectError", onReconnectError);
    socket.on("game:started", onGameStarted);
    socket.on("players:left", onPlayerLeft);
    socket.on("player:cardReceived", onCardReceived);
    socket.on("player:kicked", onPlayerKicked);

    return () => {
      socket.off("room:joined", onJoined);
      socket.off("room:playerJoined", onPlayerJoined);
      socket.off("room:playersUpdated", onReadyUpdated);
      socket.off("room:playerReconnected", onPlayerReconnected);
      socket.off("room:left", onLeft);
      socket.off("room:error", onError);
      socket.off("room:reconnectError", onReconnectError);
      socket.off("game:started", onGameStarted);
      socket.off("players:left", onPlayerLeft);
      socket.off("player:cardReceived", onCardReceived);
      socket.off("player:kicked", onPlayerKicked);
    };
  }, [socket, navigate, store]);

  const myPlayer = useMemo(() => {
    if (store.mySocketId) {
      return store.players.find((p) => p.socketId === store.mySocketId);
    }

    return store.players.find((p) => p.name === store.playerName);
  }, [store.players, store.playerName, store.mySocketId]);

  const isReady = myPlayer?.isReady ?? false;

  const canStartGame = useMemo(() => {
    return (
      store.isHost &&
      store.gameState === "READY_CHECK" &&
      store.players.length >= 2 &&
      store.players.every((p) => p.isReady)
    );
  }, [store.isHost, store.gameState, store.players]);

  const handleReady = useCallback(() => {
    if (!socket || !roomCode) return;

    setHandleIsReady(true);

    socket.emit("player:ready", {
      roomCode,
      playerName: store.playerName,
    });
  }, [socket, roomCode, store.playerName]);

  const handleStartGame = useCallback(() => {
    if (!socket || !roomCode) return;

    if (!store.isHost) {
      alert("Только хост может начать игру!");
      return;
    }

    socket.emit("game:start", {
      roomCode,
    });
  }, [socket, roomCode, store.isHost]);

  const handleKick = useCallback(
    (playerName: string) => {
      if (!socket || !roomCode || !store.isHost) return;

      socket.emit("host:kick", {
        roomCode,
        playerName,
      });
    },
    [socket, roomCode, store.isHost],
  );

  const handleLeave = useCallback(() => {
    if (!confirm("Выйти из комнаты?")) return;

    if (!socket || !roomCode) return;

    socket.emit("player:left", {
      playerName: store.playerName,
      roomCode,
    });
  }, [socket, roomCode, store.playerName]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.roomInfo}>
          <span className={styles.code}>🏠 {roomCode}</span>

          <span className={styles.status}>
            {store.gameState === "WAITING" && "⏳ Ожидание игроков"}
            {store.gameState === "READY_CHECK" && "✅ Проверка готовности"}
            {store.gameState === "GAME_RUNNING" && "🎮 Игра идёт"}
            {store.gameState === "FINISHED" && "🏆 Игра окончена"}
          </span>
        </div>

        <div className={styles.connection}>
          <button onClick={handleLeave} className={styles.leaveBtn}>
            ✕ Выйти
          </button>

          {isConnected ? "🟢" : "🔴"}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.left}>
          <PlayerList
            players={store.players}
            isHost={store.isHost}
            onKick={handleKick}
          />
        </div>

        <div className={styles.right}>
          {store.gameState === "WAITING" && (
            <div className={styles.waitingInfo}>
              <h3>⏳ Ожидание начала игры</h3>
              <p>Подождите пока все игроки подключатся</p>
              <p className={styles.hint}>
                Игроков: {store.players.length} / 12
              </p>
            </div>
          )}

          {store.gameState === "READY_CHECK" && (
            <div className={styles.readyInfo}>
              <h3>✅ Готовность</h3>

              <p>
                Готово: {store.players.filter((p) => p.isReady).length} /{" "}
                {store.players.length}
              </p>

              {store.isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  className={`${styles.startGameBtn} ${
                    canStartGame ? styles.active : styles.disabled
                  }`}
                >
                  {canStartGame
                    ? "🚀 Начать игру"
                    : "⏳ Ожидание готовности всех игроков"}
                </button>
              )}
            </div>
          )}
        </div>

        {store.gameState !== "GAME_RUNNING" &&
          store.gameState !== "FINISHED" && (
            <button
              onClick={handleReady}
              className={`${styles.readyBtn} ${
                isReady ? styles.ready : styles.notReady
              }`}
              disabled={!isConnected || handleIsReady}
            >
              {isReady ? "✅ Готов" : "⏳ Не готов"}
            </button>
          )}
      </div>
    </div>
  );
});
