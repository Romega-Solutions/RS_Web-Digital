import type { ReactNode } from "react";
import styles from "./SectionIntro.module.css";

type SectionIntroProps = {
  title: ReactNode;
  body?: ReactNode;
  eyebrow?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

export function SectionIntro({
  title,
  body,
  eyebrow,
  align = "start",
  className = "",
}: SectionIntroProps) {
  const classes = [styles.root, align === "center" ? styles.alignCenter : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 className={styles.title}>{title}</h2>
      {body ? <p className={styles.body}>{body}</p> : null}
    </div>
  );
}
