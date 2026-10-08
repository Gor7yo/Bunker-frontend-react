import { createContext, useContext } from "react";

import type { GamePhase, GameView, RoomView } from "../../api/types";

export type GameEvent = `game:${string}` | `mod:${string}`;

/** Which side drawer is open: moderator console or one player's card. */
export type SidePanel =
  | { kind: "console" }
  | { kind: "player"; playerId: string }
  | { kind: "log" }
  | { kind: "help" }
  | null;

export interface GameActions {
  /** Sends a command; errors are shown at the top of the screen. */
  act: (event: GameEvent, payload?: object) => void;
  pending: boolean;
  /** Moderator's timer for phases and speakers, seconds or null. */
  modSeconds: number | null;
  openSide: (panel: SidePanel) => void;
}

export const GameActionsContext = createContext<GameActions>({
  act: () => undefined,
  pending: false,
  modSeconds: null,
  openSide: () => undefined,
});

export const useGameActions = () => useContext(GameActionsContext);

export const PHASE_LABELS: Record<GamePhase, string> = {
  INTRO: "Вступление",
  REVEAL: "Раскрытие",
  DISCUSSION: "Обсуждение",
  VOTING: "Голосование",
  DEFENSE: "Оправдание",
  VOTE_RESULT: "Итоги голосования",
  EXILE: "Изгнание",
  FINISHED: "Игра окончена",
};

/** Whether the viewer may reveal one of their characteristics right now. */
export const canRevealNow = (view: RoomView, game: GameView, isAlivePlayer: boolean) => {
  if (!isAlivePlayer) return false;
  // "Исповедь": the target reveals something of their choice right away.
  if (game.confession?.targetId === view.meId) return true;
  if (game.phase !== "REVEAL") return false;
  const isMyTurn = game.speakerId === view.meId;
  if (view.settings.mode === "AUTO") return isMyTurn && !game.revealedThisTurn;
  return game.speakerId === null || (isMyTurn && !game.revealedThisTurn);
};
