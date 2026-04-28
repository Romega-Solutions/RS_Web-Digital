"use client";

import { TEAM_MEMBERS, type TeamMember } from "@/lib/constants";
import Image from "next/image";
import { useCallback, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import styles from "./TeamCarousel.module.css";

type TeamCarouselProps = {
  onMemberClick?: (member: TeamMember) => void;
};

export function TeamCarousel({ onMemberClick }: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (direction: 1 | -1) => {
      if (isAnimating) {
        return;
      }

      setIsAnimating(true);
      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + direction;

        if (nextIndex >= TEAM_MEMBERS.length) {
          return 0;
        }

        if (nextIndex < 0) {
          return TEAM_MEMBERS.length - 1;
        }

        return nextIndex;
      });

      window.setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating],
  );

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) {
      return;
    }

    setIsAnimating(true);
    setCurrentIndex(index);
    window.setTimeout(() => setIsAnimating(false), 600);
  };

  const onTouchStart = (event: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const onTouchMove = (event: TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      return;
    }

    const distance = touchStart - touchEnd;

    if (distance > 50) {
      handleScroll(1);
    }

    if (distance < -50) {
      handleScroll(-1);
    }
  };

  const handleTrackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleScroll(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleScroll(1);
    }
  };

  const visibleMembers = Array.from({ length: 7 }, (_, offset) => {
    const relativePosition = offset - 3;
    const index = (currentIndex + relativePosition + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;

    return {
      member: TEAM_MEMBERS[index],
      position: offset,
    };
  });

  return (
    <section className={styles.root} aria-labelledby="team-heading">
      <div className={styles["bg-grid"]} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="team-heading" className={styles.title}>
            Meet the Experts Behind Your Success
          </h2>
          <p className={styles.description}>
            Our team brings a blend of strategic insight, market perspective, and
            practical experience in team building and brand support.
          </p>
        </div>

        <div
          className={styles["track-wrapper"]}
          tabIndex={0}
          onKeyDown={handleTrackKeyDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div ref={trackRef} className={styles.track}>
            {visibleMembers.map(({ member, position }) => {
              const isCenter = position === 3;
              const positionClass = styles[`item--position-${position}`];
              const centerClass = isCenter ? styles["item--center"] : "";

              return (
                <div
                  key={`${member.id}-${position}`}
                  className={`${styles.item} ${positionClass} ${centerClass}`}
                >
                  <button
                    type="button"
                    className={`${styles.card} ${
                      member.id === "rich-salvador" ? styles["card--white-bg"] : ""
                    }`}
                    aria-label={`${member.name}, ${member.title}`}
                    disabled={!isCenter}
                    onClick={() => isCenter && onMemberClick?.(member)}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 200px, 400px"
                    />

                    <div className={styles.overlay}>
                      <h3 className={styles.name}>{member.name}</h3>
                      <p className={styles.role}>{member.title}</p>
                    </div>

                    {isCenter ? <div className={styles.cta}>View Profile</div> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.button}
            onClick={() => handleScroll(-1)}
            aria-label="Previous team member"
            disabled={isAnimating}
          >
            <span className={styles.icon} aria-hidden="true">
              &lt;
            </span>
          </button>

          <div className={styles.dots}>
            {TEAM_MEMBERS.map((member, index) => (
              <button
                key={member.id}
                type="button"
                className={`${styles.dot} ${
                  index === currentIndex ? styles["dot--active"] : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${member.name}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.button}
            onClick={() => handleScroll(1)}
            aria-label="Next team member"
            disabled={isAnimating}
          >
            <span className={styles.icon} aria-hidden="true">
              &gt;
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
