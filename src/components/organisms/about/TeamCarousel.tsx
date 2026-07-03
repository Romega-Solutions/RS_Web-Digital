"use client";

import { TEAM_MEMBERS, type TeamMember } from "@/lib/constants";
import { SectionIntro } from "@/components/molecules/content/SectionIntro";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import styles from "./TeamCarousel.module.css";

type TeamCarouselProps = {
  onMemberClick?: (member: TeamMember) => void;
};

function getCircularDistance(index: number, currentIndex: number, length: number) {
  const directDistance = Math.abs(index - currentIndex);

  return Math.min(directDistance, length - directDistance);
}

export function TeamCarousel({ onMemberClick }: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDotDistance, setMaxDotDistance] = useState(2);

  useEffect(() => {
    const updateDotRange = () => {
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      setMaxDotDistance(isMobile ? 1 : 2);
    };

    updateDotRange();
    window.addEventListener("resize", updateDotRange);

    return () => {
      window.removeEventListener("resize", updateDotRange);
    };
  }, []);

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
        <SectionIntro
          align="center"
          className={styles.header}
          titleClassName={styles.teamTitle}
          bodyClassName={styles.teamBody}
          title={<span id="team-heading">Meet the People Behind Romega</span>}
          body="A team shaped by practical experience in talent, brand support, and steady business growth."
        />

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
                  <div
                    className={`${styles.card} ${
                      member.id === "rich-salvador" ? styles["card--white-bg"] : ""
                    }`}
                  >
                    <a
                      href={member.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.imageLink}
                      aria-label={`Open ${member.name}'s image in a new tab`}
                    >
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 200px, 400px"
                      />
                    </a>

                    <div className={styles.overlay}>
                      <h3 className={styles.name}>{member.name}</h3>
                      <p className={styles.role}>{member.title}</p>
                    </div>

                    {isCenter ? (
                      <button
                        type="button"
                        className={styles.cta}
                        onClick={() => onMemberClick?.(member)}
                        aria-label={`Open ${member.name} profile`}
                      >
                        View Profile
                      </button>
                    ) : null}
                  </div>
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
            {TEAM_MEMBERS.map((member, index) => {
              const isActive = index === currentIndex;
              const isMobileHidden =
                getCircularDistance(index, currentIndex, TEAM_MEMBERS.length) >
                maxDotDistance;

              return (
                <button
                  key={member.id}
                  type="button"
                  className={`${styles.dot} ${isActive ? styles["dot--active"] : ""} ${
                    isMobileHidden ? styles["dot--hidden"] : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to ${member.name}`}
                  aria-current={isActive ? "true" : "false"}
                />
              );
            })}
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
