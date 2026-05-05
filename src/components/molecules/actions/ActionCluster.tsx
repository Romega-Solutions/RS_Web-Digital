import type { ReactNode } from "react";
import styles from "./ActionCluster.module.css";

type ActionClusterProps = {
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

export function ActionCluster({
  children,
  align = "start",
  className = "",
}: ActionClusterProps) {
  const classes = [
    styles.root,
    align === "center" ? styles.center : "",
    align === "end" ? styles.end : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
