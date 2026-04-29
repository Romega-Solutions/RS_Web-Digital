import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./DropdownNavItem.module.css";

type DropdownNavItemProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
  title: ReactNode;
  description?: ReactNode;
  isActive?: boolean;
  className?: string;
};

export function DropdownNavItem({
  title,
  description,
  isActive = false,
  className = "",
  ...props
}: DropdownNavItemProps) {
  const classes = [styles.link, isActive ? styles.active : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link {...props} className={classes}>
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </Link>
  );
}
