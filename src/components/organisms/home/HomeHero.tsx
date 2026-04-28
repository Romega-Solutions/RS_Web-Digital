"use client";

import Image from "next/image";
import { ExploreServicesButton } from "@/components/atoms/Button";
import { motion } from "framer-motion";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({ buttonHref = "/services" }: HomeHeroProps) {
  return (
    <section className="home-hero">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/2.0%20Website%20Assets/Hero%20Background.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </motion.div>
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="home-hero__content">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 1.11, 0.81, 0.99] }}
          className="home-hero__headline"
        >
          <span className="home-hero__line home-hero__line--first">
            Built for <span className="growing-word">growing</span> businesses.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.21, 1.11, 0.81, 0.99] }}
          className="home-hero__line home-hero__subtitle"
        >
          Designed for <span className="home-hero__accent">what&apos;s next.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }}
          className="home-hero__copy"
        >
          <span className="home-hero__copy-line">     
            Partnering with businesses to grow teams, 
          </span>
          <span className="home-hero__copy-line">     
            strengthen brands, and scale with confidence.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          <ExploreServicesButton variant="primary" size="lg" href={buttonHref} />
        </motion.div>
      </div>
    </section>
  );
}
