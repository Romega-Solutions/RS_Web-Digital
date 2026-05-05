import type { ReactNode } from "react";
import styles from "./LegalActionRow.module.css";

type LegalActionRowProps = {
  children: ReactNode;
};

export function LegalActionRow({ children }: LegalActionRowProps) {
  return <div className={styles.root}>{children}</div>;
}
