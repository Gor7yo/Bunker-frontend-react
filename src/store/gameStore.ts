import { makeAutoObservable, reaction, toJS } from "mobx";
import type { Socket } from "socket.io-client";

export interface IPlayer {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isAlive: boolean;
  characters?: any;
}

export interface IPlayerCard {
  age: string | null;
  profession: string | null;
  health: string | null;
  fobia: string | null;
  hobbie: string | null;
  bandage: string | null;
  action: string | null;
  fact: string | null;
}

interface IPlayerCardHost {
  playerName: string | null;
  age: string | null;
  profession: string | null;
  health: string | null;
  fobia: string | null;
  hobbie: string | null;
  bandage: string | null;
  action: string | null;
  fact: string | null;
}

const STORAGE_KEYS = {
  GAME_DATA: "gameData",
  SOCKET_ID: "socketId",
  PLAYER_NAME: "playerName",
} as const;

export default class GameStateStore {
  roomCode: string | null = null;
  players: IPlayer[] = [];
  gameState: "WAITING" | "READY_CHECK" | "GAME_RUNNING" | "FINISHED" =
    "WAITING";
  isHost: boolean = false;
  playerName: string = "";
  myCard: IPlayerCard | null = null;
  mySocketId: string | null = null;

  socket: Socket | null = null;
  isConnected: boolean = false;

  get allReady(): boolean {
    return (
      this.players.length > 0 &&
      this.players.every((player) => player.isReady === true)
    );
  }

  get myPlayer(): IPlayer | undefined {
    return this.players.find((p) => p.id === this.mySocketId);
  }

  get allDead(): boolean {
    return (
      this.players.length > 0 && this.players.every((p) => p.isAlive === false)
    );
  }

  constructor(initialState?: Partial<GameStateStore>) {
    makeAutoObservable(
      this,
      {
        saveToStorage: false,
        loadFromStorage: false,
        setupAutoSave: false,
        clearStorage: false,
      },
      { autoBind: true },
    );

    this.loadFromStorage();

    if (initialState) {
      Object.assign(this, initialState);
    }

    this.setupAutoSave();
  }

  setupAutoSave = () => {
    reaction(
      () => ({
        roomCode: this.roomCode,
        players: this.players.map((p) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
          isHost: p.isHost,
          isAlive: p.isAlive,
        })),
        playerName: this.playerName,
        isHost: this.isHost,
        gameState: this.gameState,
        mySocketId: this.mySocketId,
        isConnected: this.isConnected,
      }),
      (data) => {
        this.saveToStorage(data);
      },
      {
        fireImmediately: false,
        delay: 300,
      },
    );
  };

  saveToStorage = (data: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_DATA, JSON.stringify(data));

      if (this.mySocketId) {
        localStorage.setItem(STORAGE_KEYS.SOCKET_ID, this.mySocketId);
      }

      if (this.playerName) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, this.playerName);
      }

      console.log("💾 Данные сохранены в localStorage");
    } catch (error) {
      console.error("❌ Failed to save data:", error);
    }
  };

  loadFromStorage = (): void => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.GAME_DATA);
      if (savedData) {
        const data = JSON.parse(savedData);

        this.roomCode = data.roomCode || null;
        this.players = data.players || [];
        this.playerName = data.playerName || "";
        this.isHost = data.isHost || false;
        this.gameState = data.gameState || "WAITING";
        this.mySocketId = data.mySocketId || null;

        console.log("📂 Данные загружены из localStorage");
      }

      if (!this.mySocketId) {
        const socketId = localStorage.getItem(STORAGE_KEYS.SOCKET_ID);
        if (socketId) {
          this.mySocketId = socketId;
        }
      }

      if (!this.playerName) {
        const playerName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
        if (playerName) {
          this.playerName = playerName;
        }
      }
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  };

  saveNow = (): void => {
    const data = {
      roomCode: this.roomCode,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        isReady: p.isReady,
        isHost: p.isHost,
        isAlive: p.isAlive,
        characters: p.characters,
      })),
      playerName: this.playerName,
      isHost: this.isHost,
      gameState: this.gameState,
      mySocketId: this.mySocketId,
      isConnected: this.isConnected,
    };
    this.saveToStorage(data);
  };

  clearStorage = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
      localStorage.removeItem(STORAGE_KEYS.SOCKET_ID);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
      console.log("🗑️ localStorage очищен");
    } catch (error) {
      console.error("❌ Failed to clear storage:", error);
    }
  };

  setRoomCode = (code: string): void => {
    this.roomCode = code;
    this.saveNow();
  };

  setPlayers = (players: IPlayer[]): void => {
    this.players = players;
  };

  setGameState = (
    gameState: "WAITING" | "READY_CHECK" | "GAME_RUNNING" | "FINISHED",
  ): void => {
    this.gameState = gameState;
  };

  setIsHost = (isHost: boolean): void => {
    this.isHost = isHost;
  };

  setPlayerName = (name: string): void => {
    this.playerName = name;
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
    } catch (error) {
      console.error("❌ Failed to save player name:", error);
    }
  };

  setMyCard = (card: IPlayerCard | null): void => {
    this.myCard = card;
  };

  setMySocketId = (id: string | null): void => {
    this.mySocketId = id;
    if (id) {
      try {
        localStorage.setItem(STORAGE_KEYS.SOCKET_ID, id);
      } catch (error) {
        console.error("❌ Failed to save socket ID:", error);
      }
    }
  };

  setSocket = (socket: Socket) => {
    this.socket = socket;
  };

  setIsConnected = (isConnected: boolean) => {
    this.isConnected = isConnected;
  };

  updatePlayer = (playerId: string, updates: Partial<IPlayer>): void => {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      this.players[index] = { ...this.players[index], ...updates };
    }
  };

  addPlayer = (player: IPlayer): void => {
    if (!this.players.find((p) => p.id === player.id)) {
      this.players.push(player);
    }
  };

  addPlayerCard = (playerName: string, card: IPlayerCard): void => {
    const player = this.players.find((p) => p.name === playerName);
    if (!player) {
      this.players.map((p) =>
        p.name === playerName ? (p.characters = card) : p,
      );
    }
  };

  removePlayer = (playerId: string): void => {
    this.players = this.players.filter((p) => p.id !== playerId);
  };

  togglePlayerReady = (playerId: string): void => {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.isReady = !player.isReady;
    }
  };

  reset = (): void => {
    this.roomCode = null;
    this.players = [];
    this.gameState = "WAITING";
    this.isHost = false;
    this.playerName = "";
    this.myCard = null;
    this.mySocketId = null;

    this.clearStorage();
  };
}

export const gameStore = new GameStateStore();
