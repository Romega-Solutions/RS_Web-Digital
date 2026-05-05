import React from "react";
import styles from "./MainTemplate.module.css";

interface MainTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
  shellVariant?: "default" | "home" | "hero";
  mainClassName?: string;
}

export function MainTemplate({
  jsonLd,
  header,
  children,
  footer,
  className = "",
  shellVariant = "default",
  mainClassName = "",
}: MainTemplateProps) {
  const rootClassName = [
    styles.root,
    shellVariant === "home" || shellVariant === "hero" ? styles.rootHome : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} data-shell-variant={shellVariant} id="top">
      {jsonLd}
      {header}

      <main
        id="main-content"
        tabIndex={-1}
        className={[styles.main, mainClassName].filter(Boolean).join(" ")}
      >
        {children}
      </main>

      {footer}
    </div>
  );
}
