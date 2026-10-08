import type { RoomSettings, SettingsPatch } from "./types";

/** Applies a partial settings patch locally (the server does the same). */
export const applySettingsPatch = (base: RoomSettings, patch: SettingsPatch): RoomSettings => ({
  ...base,
  ...patch,
  timers: { ...base.timers, ...patch.timers },
  actions: { ...base.actions, ...patch.actions },
});
