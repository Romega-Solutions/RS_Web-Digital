"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
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
      <div className="prose prose-sm max-w-none md:prose-base">
        {children}
      </div>
      
      <div className="mt-12 flex justify-center border-t border-gray-100 pt-8 md:justify-end">
        <LegalPageCloseButton />
      </div>
    </motion.div>
  );
}
