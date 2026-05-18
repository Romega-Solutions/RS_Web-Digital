import type { ReactNode } from "react";
import styles from "./SectionIntro.module.css";

type SectionIntroProps = {
  title: ReactNode;
  body?: ReactNode;
  eyebrow?: ReactNode;
  align?: "start" | "center";
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
};

export function SectionIntro({
  title,
  body,
  eyebrow,
  align = "start",
  className = "",
  titleClassName = "",
  bodyClassName = "",
}: SectionIntroProps) {
  const classes = [styles.root, align === "center" ? styles.alignCenter : "", className]
    .filter(Boolean)
    .join(" ");
  const titleClasses = [styles.title, titleClassName].filter(Boolean).join(" ");
  const bodyClasses = [styles.body, bodyClassName].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 className={titleClasses}>{title}</h2>
      {body ? <p className={bodyClasses}>{body}</p> : null}
    </div>
  );
}
