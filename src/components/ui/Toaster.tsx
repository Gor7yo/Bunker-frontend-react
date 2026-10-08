import { observer } from "mobx-react-lite";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { toastStore, type ToastTone } from "../../store/toastStore";
import { cx } from "./cx";
import styles from "./Toaster.module.css";

const ICONS: Record<ToastTone, typeof Info> = {
  error: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

/** Renders toasts at the bottom-left (the bottom-right belongs to the media dock). */
export const Toaster = observer(() => (
  <div className={styles.region} role="status" aria-live="polite">
    {toastStore.toasts.map((toast) => {
      const Icon = ICONS[toast.tone];
      return (
        <div key={toast.id} className={cx(styles.toast, styles[toast.tone], toast.leaving && styles.leaving)}>
          <Icon size={18} className={styles.icon} />
          <span className={styles.text}>{toast.text}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => toastStore.dismiss(toast.id)}
            aria-label="Закрыть"
          >
            <X size={14} />
          </button>
        </div>
      );
    })}
  </div>
));
