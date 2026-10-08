import { useState } from "react";

/**
 * Wraps an async action with pending/error state for buttons and forms.
 * With `onError` the error goes there (e.g. a toast) instead of `error`.
 */
export function useAction({ onError }: { onError?: (message: string) => void } = {}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setPending(true);
    setError(null);
    try {
      return await action();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (onError) onError(message);
      else setError(message);
      return undefined;
    } finally {
      setPending(false);
    }
  };

  return { run, pending, error, setError };
}
