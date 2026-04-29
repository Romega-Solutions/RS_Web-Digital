"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function LegalPageCloseButton() {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <motion.button
      type="button"
      onClick={handleClose}
      className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-secondary px-10 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-[#1a5595]"
      aria-label="Close legal page"
      whileHover={{ y: -4, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "backOut" }}
    >
      <span>Close Legal Review</span>
      <svg 
        className="h-5 w-5 transition-transform group-hover:rotate-90" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  );
}

