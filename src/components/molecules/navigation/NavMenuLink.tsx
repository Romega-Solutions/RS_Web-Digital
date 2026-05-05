import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./NavMenuLink.module.css";

type NavMenuLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
  isActive?: boolean;
  className?: string;
  children: ReactNode;
};

export function NavMenuLink({
  isActive = false,
  className = "",
  children,
  ...props
}: NavMenuLinkProps) {
  const classes = [styles.link, isActive ? styles.active : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link {...props} className={classes}>
      {children}
    </Link>
  );
}
