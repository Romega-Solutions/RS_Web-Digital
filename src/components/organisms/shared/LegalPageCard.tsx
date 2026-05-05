"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LegalActionRow } from "@/components/molecules/legal/LegalActionRow";
import { LegalRichText } from "@/components/molecules/legal/LegalRichText";
import { LegalPageCloseButton } from "@/components/organisms/shared/LegalPageCloseButton";
import styles from "./LegalPageCard.module.css";

interface LegalPageCardProps {
  children: ReactNode;
}

export function LegalPageCard({ children }: LegalPageCardProps) {
  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <LegalRichText>
          {children}
        </LegalRichText>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <LegalActionRow>
          <LegalPageCloseButton />
        </LegalActionRow>
      </motion.div>
    </motion.div>
  );
}

