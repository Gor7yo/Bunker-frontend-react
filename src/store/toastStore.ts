import { makeAutoObservable } from "mobx";

export type ToastTone = "error" | "info" | "success";

export interface Toast {
  id: number;
  tone: ToastTone;
  text: string;
  leaving: boolean;
}

const LIFETIME_MS = 4000;
const LEAVE_MS = 250;
const MAX_TOASTS = 4;

/** Short-lived notifications in the corner of the screen. */
class ToastStore {
  toasts: Toast[] = [];
  private nextId = 1;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  show(text: string, tone: ToastTone = "info") {
    // The same message twice in a row just restarts the old one.
    this.toasts = this.toasts.filter((t) => t.text !== text);
    const toast: Toast = { id: this.nextId++, tone, text, leaving: false };
    this.toasts = [...this.toasts, toast].slice(-MAX_TOASTS);
    setTimeout(() => this.dismiss(toast.id), LIFETIME_MS);
  }

  error(text: string) {
    this.show(text, "error");
  }

  dismiss(id: number) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.leaving) return;
    toast.leaving = true;
    setTimeout(() => this.remove(id), LEAVE_MS);
  }

  private remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toastStore = new ToastStore();
