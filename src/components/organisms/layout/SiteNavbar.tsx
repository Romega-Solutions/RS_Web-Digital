"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export type SiteHeaderActiveItem =
  | "Home"
  | "About"
  | "Services"
  | "Careers & Talents"
  | "Careers";

type SiteNavbarProps = {
  activeItem?: SiteHeaderActiveItem;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
] as const;

const careersMenuItems = [
  { label: "Careers", href: "/careers" },
  { label: "Talents", href: "/talent" },
] as const;

export function SiteNavbar({
  activeItem,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: SiteNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileCareersOpen, setIsMobileCareersOpen] = useState(
    activeItem === "Careers" || activeItem === "Careers & Talents",
  );

  const handleCloseMobileMenu = useCallback(() => {
    onCloseMobileMenu();
    setIsMobileCareersOpen(activeItem === "Careers" || activeItem === "Careers & Talents");
  }, [activeItem, onCloseMobileMenu]);

  const handleToggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      handleCloseMobileMenu();
      return;
    }

    onToggleMobileMenu();
    setIsMobileCareersOpen(activeItem === "Careers" || activeItem === "Careers & Talents");
  }, [activeItem, handleCloseMobileMenu, isMobileMenuOpen, onToggleMobileMenu]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    function handleResize() {
      if (window.innerWidth >= 1024) {
        handleCloseMobileMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCloseMobileMenu();
        setIsDropdownOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [handleCloseMobileMenu, isMobileMenuOpen]);

  return (
    <div className="site-nav">
      <div className="site-nav__desktop-row">
        <nav className="site-nav__menu" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`site-nav__link ${
                item.label === activeItem ? "site-nav__link--active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div
            className="site-nav__dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              type="button"
              className={`site-nav__link site-nav__dropdown-trigger ${
                activeItem === "Careers" || activeItem === "Careers & Talents" ? "site-nav__link--active" : ""
              }`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              onClick={() => setIsDropdownOpen((open) => !open)}
            >
              Careers
              <span className="site-nav__dropdown-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            <div
              className={`site-nav__dropdown-menu ${isDropdownOpen ? "site-nav__dropdown-menu--open" : ""}`}
              role="menu"
              aria-label="Careers and Talents"
            >
              {careersMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="site-nav__dropdown-item"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="site-nav__cta-wrap">
          <span className="site-nav__cta-arrow" aria-hidden="true">
            →
          </span>
          <Link href="/contact" className="site-nav__cta">
            Contact Us
          </Link>
          <button
            type="button"
            className={`site-nav__burger ${isMobileMenuOpen ? "site-nav__burger--open" : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={handleToggleMobileMenu}
          >
            <span className="site-nav__burger-line" aria-hidden="true" />
            <span className="site-nav__burger-line" aria-hidden="true" />
            <span className="site-nav__burger-line" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="site-nav__mobile-overlay"
          aria-label="Close navigation menu"
          onClick={handleCloseMobileMenu}
        />
      ) : null}

      <nav
        id="mobile-nav-menu"
        className={`site-nav__mobile ${isMobileMenuOpen ? "site-nav__mobile--open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`site-nav__link site-nav__mobile-link ${
              item.label === activeItem ? "site-nav__link--active" : ""
            }`}
            onClick={handleCloseMobileMenu}
          >
            {item.label}
          </Link>
        ))}
        <div className="site-nav__mobile-group">
          <button
            type="button"
            className="site-nav__link site-nav__mobile-link site-nav__mobile-group-label"
            aria-expanded={isMobileCareersOpen}
            aria-controls="mobile-careers-submenu"
            onClick={() => setIsMobileCareersOpen((open) => !open)}
          >
            Careers
            <span className={`site-nav__mobile-caret ${isMobileCareersOpen ? "site-nav__mobile-caret--open" : ""}`}>
              ▾
            </span>
          </button>
          <div
            id="mobile-careers-submenu"
            className={`site-nav__mobile-submenu ${
              isMobileCareersOpen ? "site-nav__mobile-submenu--open" : ""
            }`}
          >
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="site-nav__link site-nav__mobile-sublink"
                onClick={handleCloseMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/contact"
          className="site-nav__cta site-nav__mobile-cta"
          onClick={handleCloseMobileMenu}
        >
          Contact Us
        </Link>
      </nav>
    </div>
  );
}
