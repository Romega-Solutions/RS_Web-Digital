"use client";

import { TEAM_MEMBERS, type TeamMember } from "@/lib/constants";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleScroll(-1);
      }

      if (event.key === "ArrowRight") {
        handleScroll(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleScroll]);

  const visibleMembers = Array.from({ length: 7 }, (_, offset) => {
    const relativePosition = offset - 3;
    const index = (currentIndex + relativePosition + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;

    return {
      member: TEAM_MEMBERS[index],
      position: offset,
    };
  });

  return (
    <section className="team-carousel" aria-labelledby="team-heading">
      <div className="team-carousel__bg-grid" aria-hidden="true" />

      <div className="team-carousel__container">
        <div className="team-carousel__header">
          <h2 id="team-heading" className="team-carousel__title">
            Meet the Experts Behind Your Success
          </h2>
          <p className="team-carousel__description">
            Our team brings a blend of strategic insight, market perspective, and
            practical experience in team building and brand support.
          </p>
        </div>

        <div
          className="team-carousel__track-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div ref={trackRef} className="team-carousel__track">
            {visibleMembers.map(({ member, position }) => {
              const isCenter = position === 3;

              return (
                <div
                  key={`${member.id}-${position}`}
                  className={`team-carousel__item team-carousel__item--position-${position} ${
                    isCenter ? "team-carousel__item--center" : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`team-carousel__card ${
                      member.id === "rich-salvador" ? "team-carousel__card--white-bg" : ""
                    }`}
                    aria-label={`${member.name}, ${member.title}`}
                    disabled={!isCenter}
                    onClick={() => isCenter && onMemberClick?.(member)}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="team-carousel__image"
                      sizes="(max-width: 768px) 200px, 400px"
                    />

                    <div className="team-carousel__overlay">
                      <h3 className="team-carousel__name">{member.name}</h3>
                      <p className="team-carousel__role">{member.title}</p>
                    </div>

                    {isCenter ? <div className="team-carousel__cta">View Profile</div> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="team-carousel__controls">
          <button
            type="button"
            className="team-carousel__button"
            onClick={() => handleScroll(-1)}
            aria-label="Previous team member"
            disabled={isAnimating}
          >
            <span className="team-carousel__icon" aria-hidden="true">
              &lt;
            </span>
          </button>

          <div className="team-carousel__dots">
            {TEAM_MEMBERS.map((member, index) => (
              <button
                key={member.id}
                type="button"
                className={`team-carousel__dot ${
                  index === currentIndex ? "team-carousel__dot--active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${member.name}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>

          <button
            type="button"
            className="team-carousel__button"
            onClick={() => handleScroll(1)}
            aria-label="Next team member"
            disabled={isAnimating}
          >
            <span className="team-carousel__icon" aria-hidden="true">
              &gt;
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
