"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LegalActionRow } from "@/components/molecules/legal/LegalActionRow";
import { LegalRichText } from "@/components/molecules/legal/LegalRichText";
import { LegalPageCloseButton } from "@/components/organisms/shared/LegalPageCloseButton";

interface LegalPageCardProps {
  children: ReactNode;
}

export function LegalPageCard({ children }: LegalPageCardProps) {
  return (
    <motion.div
      className="legal-page-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }}
    >
      <LegalRichText>
        {children}
      </LegalRichText>

      <LegalActionRow>
        <LegalPageCloseButton />
      </LegalActionRow>
    </motion.div>
  );
}
