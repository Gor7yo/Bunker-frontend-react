import { useEffect, useRef, useSyncExternalStore } from "react";

import type { GameView, RoomView } from "../api/types";
import { sfx, type SfxName } from "./sfx";

/** Sound on/off state that re-renders the toggle button. */
export const useSoundEnabled = () =>
  useSyncExternalStore(
    (fn) => sfx.subscribe(fn),
    () => sfx.enabled,
  );

/**
 * Plays sounds for what changed since the previous state: new round, phase
 * change, new log entries (reveal, action card, exile), the viewer's turn.
 * Only one sound per update — the most important one wins.
 */
export function useGameSounds(view: RoomView, game: GameView | null) {
  const prev = useRef<{ round: number; phase: string; lastLogAt: number; speakerId: string | null } | null>(null);

  useEffect(() => {
    if (!game) return;
    const lastLogAt = game.log.at(-1)?.at ?? 0;
    const before = prev.current;
    prev.current = { round: game.round, phase: game.phase, lastLogAt, speakerId: game.speakerId };
    // First render (page load, reconnect): stay quiet.
    if (!before) return;

    const fresh = game.log.filter((entry) => entry.at > before.lastLogAt);
    const has = (test: (text: string, tone: string) => boolean) => fresh.some((e) => test(e.text, e.tone));

    let sound: SfxName | null = null;
    if (game.round > before.round) sound = "round";
    else if (has((_, tone) => tone === "exile")) sound = "exile";
    else if (has((text) => text.includes("играет карту"))) sound = "action";
    else if (game.speakerId === view.meId && before.speakerId !== view.meId) sound = "myTurn";
    else if (has((_, tone) => tone === "reveal")) sound = "reveal";
    else if (game.phase !== before.phase) sound = "phase";
    else if (has((_, tone) => tone === "vote")) sound = "vote";

    if (sound) sfx.play(sound);
  }, [game, view.meId]);
}

/** Detector ticks during the last seconds of a timer. */
export function useCountdownTicks(secondsLeft: number | null) {
  useEffect(() => {
    if (secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 5) sfx.play("tick");
  }, [secondsLeft]);
}
