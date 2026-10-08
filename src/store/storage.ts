import type { SessionData } from "../api/types";

const SESSION_KEY = "bunker.session";
const NAME_KEY = "bunker.name";

// Storage can be unavailable (private mode, blocked site data) — never throw.
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

export const loadSession = (): SessionData | null => {
  try {
    const data = JSON.parse(read(SESSION_KEY) ?? "null");
    return data?.token && data?.code ? data : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: SessionData) =>
  write(SESSION_KEY, JSON.stringify(session));

export const clearSession = () => write(SESSION_KEY, null);

export const loadName = () => read(NAME_KEY) ?? "";

export const saveName = (name: string) => write(NAME_KEY, name);
