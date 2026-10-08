import { createContext, useContext } from "react";

export interface VoiceState {
  /** A LiveKit room is mounted — voice hooks are safe to use. */
  enabled: boolean;
  /** Why voice is unavailable (not configured, token error), if it is. */
  error: string | null;
}

export const VoiceContext = createContext<VoiceState>({ enabled: false, error: null });

export const useVoice = () => useContext(VoiceContext);
