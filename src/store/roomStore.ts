import { makeAutoObservable, runInAction } from "mobx";

import { request, socket } from "../api/socket";
import type {
  RoomSettings,
  RoomView,
  SessionData,
  SettingsPatch,
} from "../api/types";
import { clearSession, loadSession, saveName, saveSession } from "./storage";

/**
 * Single source of truth for the room. The server pushes a personalised
 * `room:state` after every change; actions only send requests.
 */
class RoomStore {
  view: RoomView | null = null;
  connected = false;
  /** Restoring a saved session after (re)connect. */
  resuming = loadSession() !== null;
  /** One-off message for the home page (kicked, session lost, …). */
  notice: string | null = null;
  /** serverTime − clientTime, for phase timers. */
  clockOffset = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    socket.on("connect", this.onConnect);
    socket.on("disconnect", () => runInAction(() => (this.connected = false)));
    socket.on("room:state", (view: RoomView) =>
      runInAction(() => {
        this.view = view;
        if (view.game) this.clockOffset = view.game.serverNow - Date.now();
      }),
    );
    socket.on("room:kicked", () => this.drop("Хост исключил вас из комнаты"));
    socket.on("session:replaced", () =>
      runInAction(() => {
        this.view = null;
        this.notice = "Комната открыта в другой вкладке";
      }),
    );

    socket.connect();
  }

  get me() {
    return this.view?.players.find((p) => p.id === this.view?.meId) ?? null;
  }

  get isHost() {
    return this.me?.isHost ?? false;
  }

  get isModerator() {
    return this.me?.role === "MODERATOR";
  }

  /** Still in the game with a card (not exiled, not the moderator). */
  get isAlivePlayer() {
    const me = this.me;
    return !!me && me.role === "PLAYER" && me.isAlive && !me.hasLeft;
  }

  /** Game and moderator commands: "game:vote", "mod:exile", … */
  gameAction(event: `game:${string}` | `mod:${string}`, payload: object = {}) {
    return request(event, payload);
  }

  async create(name: string, settings: RoomSettings) {
    saveName(name);
    return this.enter(
      await request<SessionData>("room:create", { name, settings }),
    );
  }

  async join(code: string, name: string) {
    saveName(name);
    return this.enter(await request<SessionData>("room:join", { code, name }));
  }

  async leave() {
    await request("room:leave");
    this.drop(null);
  }

  setReady(ready: boolean) {
    return request("lobby:ready", { ready });
  }

  updateSettings(settings: SettingsPatch) {
    return request("lobby:settings", { settings });
  }

  setModerator(playerId: string) {
    return request("lobby:setModerator", { playerId });
  }

  transferHost(playerId: string) {
    return request("room:transferHost", { playerId });
  }

  kick(playerId: string) {
    return request("lobby:kick", { playerId });
  }

  start() {
    return request("game:start");
  }

  dismissNotice() {
    this.notice = null;
  }

  private enter(session: SessionData) {
    saveSession(session);
    this.notice = null;
    return session.code;
  }

  private drop(notice: string | null) {
    clearSession();
    this.view = null;
    this.notice = notice;
  }

  private async onConnect() {
    this.connected = true;

    const session = loadSession();
    if (!session) {
      this.resuming = false;
      return;
    }

    this.resuming = true;
    try {
      await request("session:resume", { token: session.token });
    } catch {
      runInAction(() => this.drop("Комната больше недоступна"));
    } finally {
      runInAction(() => (this.resuming = false));
    }
  }
}

export const roomStore = new RoomStore();
