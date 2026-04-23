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
      className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      aria-label="Close legal page"
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      Close
    </motion.button>
  );
}
