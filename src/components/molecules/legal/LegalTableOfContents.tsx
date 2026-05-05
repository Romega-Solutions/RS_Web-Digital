"use client";

import React, { useEffect, useState } from "react";
import styles from "./LegalTableOfContents.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface ToCItem {
  id: string;
  text: string;
}

const LEGAL_CONTENT_ID = "legal-content";
const LEGAL_TOC_ID = "legal-table-of-contents";

export function LegalTableOfContents() {
  const [items, setItems] = useState<ToCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const legalContent = document.getElementById(LEGAL_CONTENT_ID);
    if (!legalContent) {
      return;
    }

    const headers = Array.from(legalContent.querySelectorAll("h2[id]"));
    const tocItems = headers.map((header) => ({
      id: header.id,
      text: header.textContent || "",
    }));
    const frameId = window.requestAnimationFrame(() => {
      setItems(tocItems);
    });

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
    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
      <button
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={LEGAL_TOC_ID}
      >
        {isOpen ? "Close" : "Sections"}
      </button>
      <nav
        id={LEGAL_TOC_ID}
        className={`${styles.root} ${isOpen ? styles.mobileOpen : ""}`}
        aria-label="Table of contents"
      >
        <h3 className={styles.title}>Table of Contents</h3>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <a
                href={`#${item.id}`}
                className={`${styles.link} ${activeId === item.id ? styles.linkActive : ""}`}
                onClick={() => setIsOpen(false)}
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
