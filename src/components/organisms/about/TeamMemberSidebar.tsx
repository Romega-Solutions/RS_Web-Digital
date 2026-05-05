"use client";

import { TEAM_MEMBERS, type TeamMember } from "@/lib/constants";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import styles from "./TeamMemberSidebar.module.css";

type TeamMemberSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onOtherMemberClick?: (member: TeamMember) => void;
};

export function TeamMemberSidebar({
  isOpen,
  onClose,
  member,
  onOtherMemberClick,
}: TeamMemberSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOtherMemberClick = useCallback(
    (otherMember: TeamMember) => {
      onOtherMemberClick?.(otherMember);
      if (panelRef.current) {
        panelRef.current.scrollTop = 0;
      }
    },
    [onOtherMemberClick],
  );

  if (!member) {
    return null;
  }

  const otherMembers = TEAM_MEMBERS.filter((m) => m.id !== member.id);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles["sidebar--open"] : ""}`}>
      <div className={styles["sidebar__overlay"]} onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        className={`${styles["sidebar__panel"]} ${isOpen ? styles["sidebar__panel--open"] : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-member-name"
        aria-describedby="sidebar-member-role"
      >
        <button
          type="button"
          className={styles["sidebar__close"]}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>

        <div className={styles["sidebar__content"]}>
          <div className={styles["sidebar__header"]}>
            <div className={styles["sidebar__image-container"]}>
              <Image
                src={member.image}
                alt={member.name}
                width={120}
                height={120}
                className={styles["sidebar__image"]}
              />
            </div>
            <div className={styles["sidebar__details"]}>
              <h2 className={styles["sidebar__last-name"]} aria-hidden="true">
                {member.name.split(" ").slice(-1)[0]}
              </h2>
              <h3 id="sidebar-member-name" className={styles["sidebar__name"]}>
                {member.name}
              </h3>
              <p id="sidebar-member-role" className={styles["sidebar__role"]}>
                {member.title}
              </p>
            </div>
          </div>

          <div className={styles["sidebar__main"]}>
            <section className={styles["sidebar__section"]}>
              <h4 className={styles["sidebar__section-title"]}>About Me</h4>
              <div className={styles["sidebar__bio"]}>
                {Array.isArray(member.bio) ? (
                  <ul className={styles["sidebar__bio-list"]}>
                    {member.bio.map((item) => (
                      <li key={item} className={styles["sidebar__bio-item"]}>
                        <p className={styles["sidebar__bio-text"]}>{item}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles["sidebar__bio-text"]}>{member.bio}</p>
                )}
              </div>
            </section>

            {member.expertise.length > 0 && (
              <section className={styles["sidebar__section"]}>
                <h4 className={styles["sidebar__section-title"]}>Top Qualifications</h4>
                <ul className={styles["sidebar__list"]}>
                  {member.expertise.map((item) => (
                    <li key={item} className={styles["sidebar__list-item"]}>
                      <span className={styles["sidebar__bullet"]}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {member.achievements.length > 0 && (
              <section className={styles["sidebar__section"]}>
                <h4 className={styles["sidebar__section-title"]}>Personal Interests</h4>
                <ul className={styles["sidebar__list"]}>
                  {member.achievements.map((item) => (
                    <li key={item} className={styles["sidebar__list-item"]}>
                      <span className={styles["sidebar__bullet"]}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles["sidebar__section"]}>
              <h4 className={styles["sidebar__section-title"]}>Contact Me</h4>
              <div className={styles["sidebar__contact-buttons"]}>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["sidebar__linkedin-button"]}
                  >
                    LinkedIn Profile
                  </a>
                )}
                <a
                  href="mailto:info@romegasolutions.com"
                  className={styles["sidebar__icon-button"]}
                  aria-label="Email info@romegasolutions.com"
                >
                  <span className={styles["sidebar__button-label"]}>info@romegasolutions.com</span>
                </a>
              </div>
            </section>

            <section className={`${styles["sidebar__section"]} ${styles["sidebar__section--explore"]}`}>
              <h4 className={styles["sidebar__section-title"]}>Explore More Romega Talents</h4>
              <div className={styles["sidebar__carousel"]}>
                {otherMembers.map((otherMember) => (
                  <div key={otherMember.id} className={styles["sidebar__carousel-item"]}>
                    <button
                      type="button"
                      onClick={() => handleOtherMemberClick(otherMember)}
                      className="group flex flex-col items-center gap-2 border-none bg-transparent p-0"
                    >
                      <div className={styles["sidebar__carousel-image-wrapper"]}>
                        <Image
                          src={otherMember.image}
                          alt={otherMember.name}
                          width={80}
                          height={80}
                          className={styles["sidebar__carousel-image"]}
                        />
                      </div>
                      <p className={styles["sidebar__carousel-name"]}>{otherMember.name}</p>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
