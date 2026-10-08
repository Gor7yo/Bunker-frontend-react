import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";
import { Spinner } from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  block?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

export const Button = ({
  variant = "secondary",
  size = "md",
  block,
  icon,
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cx(styles.button, styles[variant], styles[size], block && styles.block, className)}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <Spinner size={16} /> : icon}
    {children}
  </button>
);
