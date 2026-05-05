import type { ReactNode } from "react";
import styles from "./LegalRichText.module.css";

type LegalRichTextProps = {
  children: ReactNode;
};

export function LegalRichText({ children }: LegalRichTextProps) {
  return <div className={styles.root}>{children}</div>;
}
