import { makeAutoObservable, runInAction } from "mobx";

import { request, socket } from "../api/socket";
import type { PublicRoomSummary } from "../api/types";

/** Live list of public lobbies, active while the home page is open. */
class PublicRoomsStore {
  rooms: PublicRoomSummary[] = [];
  loading = true;
  private watchers = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    socket.on("rooms:list", (rooms: PublicRoomSummary[]) =>
      runInAction(() => (this.rooms = rooms)),
    );
    // Channel membership is lost on reconnect — subscribe again.
    socket.on("connect", () => {
      if (this.watchers > 0) void this.subscribe();
    });
  }

  /** Starts watching; returns a function that stops it. */
  watch() {
    this.watchers += 1;
    if (this.watchers === 1 && socket.connected) void this.subscribe();

    return () => {
      this.watchers -= 1;
      if (this.watchers === 0 && socket.connected) {
        void request("rooms:unwatch").catch(() => undefined);
      }
    };
  }

  private async subscribe() {
    try {
      const rooms = await request<PublicRoomSummary[]>("rooms:watch");
      runInAction(() => (this.rooms = rooms));
    } catch {
      // Keep the last known list; it refreshes on the next update.
    } finally {
      runInAction(() => (this.loading = false));
    }
  }
}

export const publicRoomsStore = new PublicRoomsStore();
