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
      className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 md:p-8"
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-6 flex justify-end">
        <LegalPageCloseButton />
      </div>
      {children}
    </motion.div>
  );
}
