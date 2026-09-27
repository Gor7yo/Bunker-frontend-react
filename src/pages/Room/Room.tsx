import { useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { useSocket } from "../../hooks/useSocket";
import { gameStore } from "../../store/gameStore";

import { PlayerList } from "../../components/PlayerList/PlayerList";

import styles from "./Room.module.css";

export const Room = observer(() => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const store = gameStore;
  const roomCode = store.roomCode;

  useEffect(() => {
    if (!socket || !roomCode) return;

    const reconnect = () => {
      console.log("🔄 socket подключен, восстанавливаем комнату");

      if (!store.playerName) {
        socket.emit("room:getState", { roomCode });
        return;
      }

      socket.emit("room:reconnect", {
        roomCode,
        playerName: store.playerName,
      });
    };

    if (!socket.connected) {
      reconnect();
    }

    socket.on("connect", reconnect);

    return () => {
      socket.off("connect", reconnect);
    };
  }, [socket, roomCode, store.playerName]);

  useEffect(() => {
    if (!socket) return;

    const onJoined = (data: any) => {
      console.log("📦 room:joined", data);

      if (data.players) {
        store.setPlayers(data.players);
      }

      if (data.gameState) {
        store.setGameState(data.gameState);
      }

      if (data.player) {
        store.setIsHost(data.player.isHost);

        if (data.player.characters) {
          store.setMyCard(data.player.characters);
        }
      }
    };

    const onPlayerJoined = (data: any) => {
      console.log("👤 Игрок вошел", data);
      store.setGameState("READY_CHECK");

      if (data.players) {
        store.setPlayers(data.players);
      }
    };

    const onPlayerLeft = (data: any) => {
      console.log("🚪 Игрок вышел", data);

      if (data.players) {
        store.setPlayers(data.players);

        if (store.players.length === 1) {
          store.setIsHost(true);
        }
      }
    };

    const onReadyUpdated = (data: any) => {
      console.log("✅ Ready update", data);
      store.setGameState("READY_CHECK");
      console.log("GAME STATE: ", store.gameState);
      if (data.players) {
        store.setPlayers(data.players);
      }
    };

    const onGameStarted = (data: any) => {
      console.log("🎮 Игра началась", data);

      store.setGameState("GAME_RUNNING");

      if (data.players) {
        store.setPlayers(data.players);
      }

      navigate(`/game`);
    };

    const onCardReceived = (data: any) => {
      console.log("🃏 Получена карта", data);

      if (data.character) {
        store.setMyCard(data.character);
      }
    };

    const onError = (data: any) => {
      console.error("❌ room:error", data);
      navigate('/')
    };

    const onReconnectError = (data: any) => {
      console.error("❌ room:reconnectError", data);
      navigate("/");
    };

    const onLeft = (data: any) => {
      console.log("👋 Выход из комнаты", data);
      store.reset();
      store.clearStorage();
      navigate("/");
    };

    socket.on("room:joined", onJoined);
    socket.on("room:playerJoined", onPlayerJoined);
    socket.on("room:playersUpdated", onReadyUpdated);
    socket.on("room:left", onLeft);
    socket.on("room:error", onError);
    socket.on("room:reconnectError", onReconnectError);
    socket.on("game:started", onGameStarted);
    socket.on("players:left", onPlayerLeft);
    socket.on("player:cardReceived", onCardReceived);

    return () => {
      socket.off("room:joined", onJoined);
      socket.off("room:playerJoined", onPlayerJoined);
      socket.off("room:error", onError);
      socket.off("room:reconnectError", onReconnectError);
      socket.off("room:left", onLeft);
      socket.off("room:playersUpdated", onReadyUpdated);
      socket.off("game:started", onGameStarted);
      socket.off("player:left", onPlayerLeft);
      socket.off("player:cardReceived", onCardReceived);
    };
  }, [socket, navigate, store]);

  const myPlayer = useMemo(() => {
    if (store.mySocketId) {
      return store.players.find((p) => p.id === store.mySocketId);
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

    socket.emit("player:ready", {
      roomCode,
      playerName: store.playerName,
    });
  }, [socket, roomCode, isReady]);

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

  const handleLeave = useCallback(() => {
    if (!confirm("Выйти из комнаты?")) return;

    if (!socket || !roomCode) return;

    console.log(store.playerName, roomCode);

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
            gameState={store.gameState}
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
                  className={`${styles.startGameBtn} ${canStartGame ? styles.active : styles.disabled}`}
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
              className={`${styles.readyBtn} ${isReady ? styles.ready : styles.notReady}`}
            >
              {isReady ? "✅ Готов" : "⏳ Не готов"}
            </button>
          )}
      </div>
    </div>
  );
});
