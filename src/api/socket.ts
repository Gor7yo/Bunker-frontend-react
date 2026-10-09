import { io } from "socket.io-client";

/**
 * Server address from VITE_SERVER_URL. Tolerates a missing protocol
 * ("api.example.com" → "https://api.example.com") and a trailing slash —
 * otherwise the browser treats it as a path on the client's own domain.
 */
const normalizeUrl = (raw: string) => {
  const url = raw.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(url)) return url;
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(url);
  return `${isLocal ? "http" : "https"}://${url}`;
};

export const SERVER_URL = normalizeUrl(import.meta.env.VITE_SERVER_URL || "http://localhost:3000");
const REQUEST_TIMEOUT_MS = 8000;

export const socket = io(`${SERVER_URL}/game`, {
  transports: ["websocket"],
  autoConnect: false,
});

type WsResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Emits an event and resolves with the server's ack, throwing its error. */
export async function request<T = undefined>(
  event: string,
  payload: object = {},
): Promise<T> {
  if (!socket.connected) throw new Error("Нет соединения с сервером");

  let result: WsResult<T>;
  try {
    result = await socket
      .timeout(REQUEST_TIMEOUT_MS)
      .emitWithAck(event, payload);
  } catch {
    throw new Error("Сервер не отвечает, попробуйте ещё раз");
  }

  if (!result.ok) throw new Error(result.error);
  return result.data;
}
