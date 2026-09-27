import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Gamepad2,
  Users,
  LogOut,
  Crown,
  Heart,
  Skull,
  User,
  Layers,
  ChevronRight,
  Vote,
  Ban,
  Loader2,
  Hourglass,
  Cake,
  Briefcase,
  Activity,
  Ghost,
  Target,
  Backpack,
  Zap,
  BookOpen,
  Circle,
} from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { gameStore, type IPlayerCard } from "../../store/gameStore";
import styles from "./Game.module.css";
import { Modal } from "../../modal-root";

interface IPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isAlive: boolean;
  characters?: any;
}

interface IPlayerCardUp extends IPlayerCard {
  playerName: string;
}

export const Game = () => {
  const { socket, isConnected } = useSocket();
  const {
    gameState,
    players,
    isHost,
    roomCode,
    reset,
    myCard,
    addPlayerCard,
    setMyCard,
    playerName,
  } = gameStore;
  const navigate = useNavigate();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showCardUp, setShowCardUp] = useState(false);
  const [currentCardUp, setCurrentCardUp] = useState<IPlayerCardUp | null>(
    null,
  );

  const currentPlayer = players.find((p) => p.name === playerName);
  const isAlive = currentPlayer?.isAlive ?? true;

  const handleRevealCard = (playerName: string) => {
    if (!isHost) return;

    socket?.emit("host:getCard", { roomCode, playerName });
  };

  const handleVote = (playerId: string) => {
    socket?.emit("game:vote", { playerId });
  };

  const handleLeave = () => {
    if (!confirm("Leave the game?")) return;

    socket?.emit("player:left", {
      playerName,
      roomCode,
    });
  };

  const toggleMyCard = () => {
    setShowCard(!showCard);
    if (!myCard) {
      socket?.emit("player:myCard", {
        playerName: playerName,
        roomCode: roomCode,
      });
    }
  };

  const toggleCardUp = (playerName: string) => {
    setShowCardUp(!showCardUp);
    if (playerName !== currentCardUp?.playerName) {
      socket?.emit("getCardUp", {
        playerName,
        roomCode: roomCode,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onGetCard = (data: any) => {
      setMyCard(data.character);
    };

    const onGetCardUp = (data: any) => {
      setCurrentCardUp(data);
    };

    if (!myCard) {
      socket.emit("player:myCard", {
        playerName: playerName,
        roomCode: roomCode,
      });
    }

    socket.on("host:getCardUp", onGetCardUp);
    socket.on("player:cardReceived", onGetCard);

    return () => {
      socket.off("host:getCardUp", onGetCard);
      socket.off("host:cardReceived", onGetCard);
    };
  }, [socket, addPlayerCard]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomLeft = () => {
      reset();
      navigate("/");
    };

    socket.on("room:left", handleRoomLeft);

    return () => {
      socket.off("room:left", handleRoomLeft);
    };
  }, [socket, reset, navigate]);

  useEffect(() => {
    if (gameState !== "GAME_RUNNING") {
      navigate("/");
    }
  }, [gameState, navigate]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.roomCode}>
            <Home size={18} />
            {roomCode}
          </span>
          <span className={styles.status}>
            <Gamepad2 size={14} />
            Game in progress
          </span>
          <span className={styles.playersCount}>
            <Users size={14} />
            {players.filter((p) => p.isAlive).length}/{players.length} alive
          </span>
        </div>
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.leaveBtn}
            onClick={handleLeave}
          >
            <LogOut size={14} />
            Leave
          </button>
          <span
            className={styles.connection}
            aria-label={isConnected ? "Connected" : "Disconnected"}
          >
            <Circle
              size={12}
              fill={isConnected ? "#34d399" : "#ff5c7a"}
              stroke="none"
            />
          </span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.gridContainer}>
          <h2 className={styles.gridTitle}>
            <Users size={18} />
            Players
          </h2>
          <div className={styles.grid}>
            {players.map((player) => {
              const isCurrent = player.id === socket?.id;
              const isSelected = selectedPlayerId === player.id;
              const hasCard = !!player.characters;

              return (
                <div
                  key={player.id}
                  className={`
                    ${styles.playerCard}
                    ${player.isAlive ? styles.alive : styles.dead}
                    ${isCurrent ? styles.current : ""}
                    ${isSelected ? styles.selected : ""}
                  `}
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  <div className={styles.playerAvatar}>
                    {player.isHost && (
                      <span className={styles.hostBadge}>
                        <Crown size={16} />
                      </span>
                    )}
                    <span className={styles.playerName}>{player.name}</span>
                  </div>

                  <div className={styles.playerStatus}>
                    {player.isAlive ? (
                      <span className={styles.aliveBadge}>
                        <Heart size={12} />
                        Alive
                      </span>
                    ) : (
                      <span className={styles.deadBadge}>
                        <Skull size={12} />
                        Dead
                      </span>
                    )}
                    {isCurrent && (
                      <span className={styles.youBadge}>
                        <User size={10} />
                        You
                      </span>
                    )}
                    {hasCard && player.isAlive && (
                      <span className={styles.cardBadge}>
                        <Layers size={14} />
                      </span>
                    )}
                  </div>

                  {isHost && player.isAlive && (
                    <button
                      type="button"
                      className={styles.revealBtn}
                      disabled={showCardUp || !isConnected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevealCard(player.name);
                        toggleCardUp(player.name);
                      }}
                    >
                      Reveal card
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>{JSON.stringify(myCard)}</div>

        <div className={styles.rightPanel}>
          <div className={styles.myCardContainer}>
            {showCard && myCard && (
              <Modal
                isOpen={showCard}
                onClose={() => setShowCard(false)}
                title="Your card"
                size="md"
              >
                <div className={styles.myCard}>
                  <div className={styles.cardFields}>
                    <div>
                      <span>
                        <Cake size={14} />
                        Age:
                      </span>{" "}
                      {myCard.age || "—"}
                    </div>
                    <div>
                      <span>
                        <Briefcase size={14} />
                        Profession:
                      </span>{" "}
                      {myCard.profession || "—"}
                    </div>
                    <div>
                      <span>
                        <Activity size={14} />
                        Health:
                      </span>{" "}
                      {myCard.health || "—"}
                    </div>
                    <div>
                      <span>
                        <Ghost size={14} />
                        Phobia:
                      </span>{" "}
                      {myCard.fobia || "—"}
                    </div>
                    <div>
                      <span>
                        <Target size={14} />
                        Hobby:
                      </span>{" "}
                      {myCard.hobbie || "—"}
                    </div>
                    <div>
                      <span>
                        <Backpack size={14} />
                        Items:
                      </span>{" "}
                      {myCard.bandage || "—"}
                    </div>
                    <div>
                      <span>
                        <Zap size={14} />
                        Action:
                      </span>{" "}
                      {myCard.action || "—"}
                    </div>
                    <div>
                      <span>
                        <BookOpen size={14} />
                        Fact:
                      </span>{" "}
                      {myCard.fact || "—"}
                    </div>
                  </div>
                </div>
              </Modal>
            )}

            {showCardUp && currentCardUp && (
              <Modal
                isOpen={showCard}
                onClose={() => setShowCardUp(false)}
                title={`${currentCardUp?.playerName} card`}
                size="md"
              >
                <div className={styles.myCard}>
                  <div className={styles.cardFields}>
                    <div>
                      <span>
                        <Cake size={14} />
                        Age:
                      </span>{" "}
                      {currentCardUp?.age || "—"}
                    </div>
                    <div>
                      <span>
                        <Briefcase size={14} />
                        Profession:
                      </span>{" "}
                      {currentCardUp?.profession || "—"}
                    </div>
                    <div>
                      <span>
                        <Activity size={14} />
                        Health:
                      </span>{" "}
                      {currentCardUp?.health || "—"}
                    </div>
                    <div>
                      <span>
                        <Ghost size={14} />
                        Phobia:
                      </span>{" "}
                      {currentCardUp?.fobia || "—"}
                    </div>
                    <div>
                      <span>
                        <Target size={14} />
                        Hobby:
                      </span>{" "}
                      {currentCardUp?.hobbie || "—"}
                    </div>
                    <div>
                      <span>
                        <Backpack size={14} />
                        Items:
                      </span>{" "}
                      {currentCardUp?.bandage || "—"}
                    </div>
                    <div>
                      <span>
                        <Zap size={14} />
                        Action:
                      </span>{" "}
                      {currentCardUp?.action || "—"}
                    </div>
                    <div>
                      <span>
                        <BookOpen size={14} />
                        Fact:
                      </span>{" "}
                      {currentCardUp?.fact || "—"}
                    </div>
                  </div>
                </div>
              </Modal>
            )}

            <button
              type="button"
              className={styles.myCardToggle}
              onClick={toggleMyCard}
              disabled={showCard || !isConnected}
            >
              <Layers size={16} />
              Show my card
            </button>
          </div>

          {isHost && (
            <div className={styles.hostPanel}>
              <h3>
                <Gamepad2 size={16} />
                Game controls
              </h3>
              <div className={styles.hostButtons}>
                <button
                  type="button"
                  className={styles.hostBtn}
                  onClick={() => {
                    socket?.emit("game:nextPhase", {
                      roomCode: roomCode,
                    });
                  }}
                >
                  <ChevronRight size={16} />
                  Next phase
                </button>
                <button
                  type="button"
                  className={styles.hostBtn}
                  onClick={() => {
                    socket?.emit("game:startVoting", {
                      roomCode: roomCode,
                    });
                  }}
                >
                  <Vote size={16} />
                  Start voting
                </button>
                <button
                  type="button"
                  className={`${styles.hostBtn} ${styles.danger}`}
                  onClick={() => {
                    if (selectedPlayerId) {
                      socket?.emit("game:kickPlayer", {
                        roomCode: roomCode,
                        playerId: selectedPlayerId,
                      });
                    }
                  }}
                >
                  <Ban size={16} />
                  Kick player
                </button>
              </div>
              {selectedPlayerId && (
                <p className={styles.selectedInfo}>
                  Selected:{" "}
                  {players.find((p) => p.id === selectedPlayerId)?.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
