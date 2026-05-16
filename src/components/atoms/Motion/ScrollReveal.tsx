"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fade" | "slideUp" | "slideRight" | "slideLeft" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  staggerChildren?: number;
}

export function ScrollReveal({
  children,
  variant = "fade",
  delay = 0,
  duration = 0.6,
  distance = 30,
  once = true,
  className = "",
  staggerChildren = 0,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseVariants: Variants = {
    hidden: {
      opacity: 0,
      y: variant === "slideUp" ? distance : 0,
      x: variant === "slideRight" ? -distance : variant === "slideLeft" ? distance : 0,
      scale: variant === "scale" ? 0.96 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a premium "drifting" feel
        staggerChildren,
      },
    },
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate={shouldReduceMotion ? "visible" : undefined}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once, margin: "-10% 0px" }}
      variants={baseVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
