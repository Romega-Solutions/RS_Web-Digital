import React from "react";
import styles from "./LegalHero.module.css";

interface LegalHeroProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
}

export function LegalHero({ title, subtitle, lastUpdated }: LegalHeroProps) {
  return (
    <section className={styles.root}>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {lastUpdated && (
            <div className={styles.meta}>
              <span className={styles.metaLabel}>Last Updated</span>
              <span className={styles.metaValue}>{lastUpdated}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.curve} aria-hidden="true">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L1440 120L1440 0C1440 0 1080 120 720 120C360 120 0 0 0 0L0 120Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
