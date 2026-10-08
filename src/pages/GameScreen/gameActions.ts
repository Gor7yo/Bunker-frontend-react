import { createContext, useContext } from "react";

import type { GamePhase } from "../../api/types";

export type GameEvent = `game:${string}` | `mod:${string}`;

export interface GameActions {
  /** Sends a command; errors are shown at the top of the screen. */
  act: (event: GameEvent, payload?: object) => void;
  pending: boolean;
  /** Moderator's timer for phases and speakers, seconds or null. */
  modSeconds: number | null;
}

export const GameActionsContext = createContext<GameActions>({
  act: () => undefined,
  pending: false,
  modSeconds: null,
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
