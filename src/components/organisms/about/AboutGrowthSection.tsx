"use client";

import { TESTIMONIALS } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./AboutGrowthSection.module.css";

export function AboutGrowthSection() {
  const totalTestimonials = TESTIMONIALS.length;
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const visibleCount = Math.min(4, totalTestimonials);

  const testimonials = useMemo(
    () => {
      if (totalTestimonials === 0) {
        return [];
      }

      return Array.from({ length: visibleCount }, (_, offset) => {
        const testimonialIndex = (startIndex + offset) % totalTestimonials;
        return TESTIMONIALS[testimonialIndex];
      });
    },
    [startIndex, totalTestimonials, visibleCount]
  );

  const showPrevious = () => {
    if (totalTestimonials === 0) return;
    setDirection(-1);
    setStartIndex((current) => (current - 1 + totalTestimonials) % totalTestimonials);
  };

  const showNext = () => {
    if (totalTestimonials === 0) return;
    setDirection(1);
    setStartIndex((current) => (current + 1) % totalTestimonials);
  };

  return (
    <section className={styles.root} aria-labelledby="about-growth-title">
      <div className={styles.heading}>
        <h2 id="about-growth-title" className={styles.title}>
          Where Growth Begins
        </h2>
        <p>
          At Romega, we believe growth isn&apos;t limited to clients, it extends to
          every individual we work with. Our interns are given the space to
          learn, contribute, and gain real-world experience that prepares them
          for the next stage of their careers.
        </p>
      </div>

      <div className={styles.inner}>
        <button
          type="button"
          className={`${styles.nav} ${styles.navLeft}`}
          aria-label="Previous testimonials"
          onClick={showPrevious}
        >
          &lsaquo;
        </button>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={startIndex}
            className={styles.grid}
            aria-live="polite"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 64 : -64 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
                when: "beforeChildren",
                staggerChildren: 0.06,
              },
            }}
            exit={{
              opacity: 0,
              x: direction > 0 ? -64 : 64,
              transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
            }}
          >
            {testimonials.map((testimonial, offset) => (
              <motion.article
                key={`${testimonial.id}-${startIndex}-${offset}`}
                className={styles.card}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.16, ease: "easeIn" } }}
                whileHover={{ y: -3 }}
              >
                <div className={styles.stars} aria-label={`${testimonial.rating} out of 5 rating`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={index < testimonial.rating ? styles.isFilled : ""}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className={styles.quote}>{testimonial.quote}</p>
                <div className={styles.person}>
                  <div className={styles.avatar}>
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className={styles.avatarImage}
                      />
                    ) : null}
                  </div>
                  <div>
                    <h3>{testimonial.name}</h3>
                    <p>{testimonial.school}</p>
                    <p>{testimonial.title}</p>
                  </div>
                </div>
                <span className={styles.mark} aria-hidden="true">
                  &quot;
                </span>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          className={`${styles.nav} ${styles.navRight}`}
          aria-label="Next testimonials"
          onClick={showNext}
        >
          &rsaquo;
        </button>
      </div>
    </section>
  );
}
