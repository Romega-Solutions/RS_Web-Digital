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
      className="inline-flex items-center justify-center rounded-full bg-brand-secondary px-8 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#245fa2]"
      aria-label="Close legal page"
      whileHover={{ y: -1, scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      Close Page
    </motion.button>
  );
}
