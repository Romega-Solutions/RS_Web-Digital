"use client";

import React, { useEffect, useState } from "react";
import styles from "./LegalTableOfContents.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface ToCItem {
  id: string;
  text: string;
}

export function LegalTableOfContents() {
  const [items, setItems] = useState<ToCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const headers = Array.from(document.querySelectorAll("h2[id]"));
    const tocItems = headers.map((h) => ({
      id: h.id,
      text: h.textContent || "",
    }));
    setItems(tocItems);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    headers.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Sections"}
      </button>
      <nav className={`${styles.root} ${isOpen ? styles.mobileOpen : ""}`} aria-label="Table of contents">
        <h3 className={styles.title}>Table of Contents</h3>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <a
                href={`#${item.id}`}
                className={`${styles.link} ${activeId === item.id ? styles.linkActive : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  setIsOpen(false);
                }}
              >
                <AnimatePresence mode="wait">
                  {activeId === item.id && (
                    <motion.span
                      layoutId="toc-active"
                      className={styles.indicator}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <span className={styles.text}>{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

