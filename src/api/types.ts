// Mirrors the server contracts (bunker-server-nesjs/src/modules/room/room.types.ts).

export const CARD_KEYS = [
  "profession",
  "age",
  "health",
  "phobia",
  "hobby",
  "baggage",
  "fact",
  "action",
] as const;

export type CardKey = (typeof CARD_KEYS)[number];

export type PlayerCard = Record<CardKey, string>;

export const CARD_LABELS: Record<CardKey, string> = {
  profession: "Профессия",
  age: "Возраст",
  health: "Здоровье",
  phobia: "Фобия",
  hobby: "Хобби",
  baggage: "Багаж",
  fact: "Факт",
  action: "Действие",
};

export type GameMode = "AUTO" | "MODERATED";
export type RoomStatus = "LOBBY" | "PLAYING" | "FINISHED";
export type PlayerRole = "PLAYER" | "MODERATOR";

export interface RoomTimers {
  reveal: number;
  discussion: number;
  voting: number;
  defense: number;
}

export interface RoomSettings {
  title: string;
  isPublic: boolean;
  mode: GameMode;
  maxPlayers: number;
  timers: RoomTimers;
}

export const DEFAULT_SETTINGS: RoomSettings = {
  title: "",
  isPublic: true,
  mode: "AUTO",
  maxPlayers: 12,
  timers: { reveal: 60, discussion: 180, voting: 30, defense: 45 },
};

export const TITLE_MAX_LENGTH = 40;
export const NAME_MAX_LENGTH = 20;

export interface PublicRoomSummary {
  code: string;
  title: string;
  mode: GameMode;
  hostName: string;
  players: number;
  maxPlayers: number;
}

export type SettingsPatch = Partial<Omit<RoomSettings, "timers">> & {
  timers?: Partial<RoomTimers>;
};

export interface PublicPlayer {
  id: string;
  name: string;
  isHost: boolean;
  role: PlayerRole;
  isReady: boolean;
  isOnline: boolean;
  isAlive: boolean;
  hasLeft: boolean;
  revealed: Partial<PlayerCard>;
  card?: PlayerCard;
}

export interface RoomView {
  code: string;
  status: RoomStatus;
  settings: RoomSettings;
  meId: string;
  myCard: PlayerCard | null;
  myRevealed: CardKey[];
  players: PublicPlayer[];
  game: GameView | null;
}

export interface SessionData {
  code: string;
  token: string;
}

// ---- game -----------------------------------------------------------------

export type GamePhase =
  | "INTRO"
  | "REVEAL"
  | "DISCUSSION"
  | "VOTING"
  | "DEFENSE"
  | "VOTE_RESULT"
  | "EXILE"
  | "FINISHED";

export interface Catastrophe {
  id: string;
  title: string;
  description: string;
  stay: string;
}

export interface Bunker {
  id: string;
  title: string;
  description: string;
  area: string;
  supplies: string;
  features: string[];
}

export interface VoteResult {
  votes: Record<string, string>;
  tally: Record<string, number>;
  leaders: string[];
}

export interface GameLogEntry {
  at: number;
  text: string;
  tone: "info" | "reveal" | "vote" | "exile";
}

export interface GameView {
  catastrophe: Catastrophe;
  bunker: Bunker;
  seats: number;
  round: number;
  phase: GamePhase;
  phaseEndsAt: number | null;
  serverNow: number;
  speakerId: string | null;
  turnQueue: string[];
  revealedThisTurn: boolean;
  candidates: string[];
  isRevote: boolean;
  readyToVote: string[];
  votedIds: string[];
  myVote: string | null;
  liveVotes: Record<string, string> | null;
  lastVote: VoteResult | null;
  lastExiledId: string | null;
  exiledByLot: boolean;
  requiredKey: CardKey | null;
  aliveCount: number;
  log: GameLogEntry[];
}
