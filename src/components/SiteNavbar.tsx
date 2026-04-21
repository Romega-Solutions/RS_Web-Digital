"use client";

import { useState } from "react";
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

  return (
    <>
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
          className="site-nav__burger"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={onToggleMobileMenu}
        >
          <span className="site-nav__burger-line" aria-hidden="true" />
          <span className="site-nav__burger-line" aria-hidden="true" />
          <span className="site-nav__burger-line" aria-hidden="true" />
        </button>
      </div>

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
            onClick={onCloseMobileMenu}
          >
            {item.label}
          </Link>
        ))}
        <div className="site-nav__mobile-group">
          <span className="site-nav__link site-nav__mobile-link site-nav__mobile-group-label">
            Careers
          </span>
          <div className="site-nav__mobile-submenu">
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="site-nav__link site-nav__mobile-sublink"
                onClick={onCloseMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/contact"
          className="site-nav__cta site-nav__mobile-cta"
          onClick={onCloseMobileMenu}
        >
          Contact Us
        </Link>
      </nav>
    </>
  );
}
