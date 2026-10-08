import { Loader2 } from "lucide-react";

import styles from "./Spinner.module.css";

export const Spinner = ({ size = 20, label = "Загрузка" }: { size?: number; label?: string }) => (
  <Loader2 size={size} className={styles.spinner} role="status" aria-label={label} />
);
