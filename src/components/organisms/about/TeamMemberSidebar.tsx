"use client";

import { TEAM_MEMBERS, type TeamMember } from "@/lib/constants";
import Image from "next/image";
import { useEffect } from "react";

type TeamMemberSidebarProps = {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
};

export function TeamMemberSidebar({ isOpen, member, onClose }: TeamMemberSidebarProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!member || !isOpen) {
    return null;
  }

  const nameParts = member.name.split(" ");
  const lastName = nameParts[nameParts.length - 1].toUpperCase();
  const otherMembers = TEAM_MEMBERS.filter((teamMember) => teamMember.id !== member.id).slice(0, 4);

  return (
    <div className={`team-sidebar ${isOpen ? "team-sidebar--open" : ""}`}>
      <div className="team-sidebar__overlay" onClick={onClose} aria-hidden="true" />

      <div
        className={`team-sidebar__panel ${isOpen ? "team-sidebar__panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-member-name"
      >
        <button
          type="button"
          onClick={onClose}
          className="team-sidebar__close"
          aria-label="Close team member details sidebar"
        >
          x
        </button>

        <div className="team-sidebar__content">
          <div className="team-sidebar__header">
            <div className="team-sidebar__image-container">
              <Image
                src={member.image}
                alt={member.name}
                width={120}
                height={120}
                className="team-sidebar__image"
              />
            </div>

            <div className="team-sidebar__details">
              <h2 className="team-sidebar__last-name" aria-hidden="true">
                {lastName}
              </h2>
              <h3 id="sidebar-member-name" className="team-sidebar__name">
                {member.name}
              </h3>
              <p className="team-sidebar__role">{member.role}</p>
            </div>
          </div>

          <div className="team-sidebar__main">
            <section className="team-sidebar__section">
              <h4 className="team-sidebar__section-title">About Me</h4>
              <div className="team-sidebar__bio">
                {Array.isArray(member.bio) ? (
                  <ul className="team-sidebar__bio-list">
                    {member.bio.map((item) => (
                      <li key={item} className="team-sidebar__bio-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="team-sidebar__bio-text">{member.bio}</p>
                )}
              </div>
            </section>

            <section className="team-sidebar__section">
              <h4 className="team-sidebar__section-title">Top Qualifications</h4>
              <ul className="team-sidebar__list">
                {member.expertise.map((item) => (
                  <li key={item} className="team-sidebar__list-item">
                    <span className="team-sidebar__bullet">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="team-sidebar__section">
              <h4 className="team-sidebar__section-title">Personal Interests</h4>
              <ul className="team-sidebar__list">
                {member.achievements.map((item) => (
                  <li key={item} className="team-sidebar__list-item">
                    <span className="team-sidebar__bullet">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="team-sidebar__section">
              <h4 className="team-sidebar__section-title">Contact Me</h4>
              <div className="team-sidebar__contact-buttons">
                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-sidebar__linkedin-button"
                    aria-label={`Connect with ${member.name} on LinkedIn`}
                  >
                    in
                    <span>Connect With Me</span>
                  </a>
                ) : null}
                <a
                  href="mailto:info@romegasolutions.com"
                  className="team-sidebar__icon-button"
                  aria-label="Send email"
                >
                  @
                  <span className="team-sidebar__button-label">info@romegasolutions.com</span>
                </a>
              </div>
            </section>

            <section className="team-sidebar__section team-sidebar__section--explore">
              <h4 className="team-sidebar__section-title">Explore More Romega Talents</h4>
              <div className="team-sidebar__carousel">
                {otherMembers.map((otherMember) => (
                  <div key={otherMember.id} className="team-sidebar__carousel-item">
                    <div className="team-sidebar__carousel-image-wrapper">
                      <Image
                        src={otherMember.image}
                        alt={otherMember.name}
                        width={80}
                        height={80}
                        className="team-sidebar__carousel-image"
                      />
                    </div>
                    <p className="team-sidebar__carousel-name">{otherMember.name}</p>
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
