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
      <nav className="nav-menu" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`menu-link site-navbar-link ${
              item.label === activeItem ? "menu-link-active" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}

        <div
          className="nav-dropdown"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            type="button"
            className={`menu-link site-navbar-link nav-dropdown-trigger ${
              activeItem === "Careers" || activeItem === "Careers & Talents" ? "menu-link-active" : ""
            }`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            Careers
            <span className="nav-dropdown-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          <div
            className={`nav-dropdown-menu ${isDropdownOpen ? "nav-dropdown-menu-open" : ""}`}
            role="menu"
            aria-label="Careers and Talents"
          >
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-dropdown-item"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="nav-cta-wrap">
        <span className="nav-cta-arrow" aria-hidden="true">
          →
        </span>
        <Link href="/contact" className="cta-chip site-navbar-cta">
          Contact us
        </Link>
        <button
          type="button"
          className="nav-burger"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={onToggleMobileMenu}
        >
          <span className="nav-burger-line" aria-hidden="true" />
          <span className="nav-burger-line" aria-hidden="true" />
          <span className="nav-burger-line" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="mobile-nav-menu"
        className={`nav-menu-mobile ${isMobileMenuOpen ? "nav-menu-mobile-open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`menu-link nav-menu-mobile-link site-navbar-link ${
              item.label === activeItem ? "menu-link-active" : ""
            }`}
            onClick={onCloseMobileMenu}
          >
            {item.label}
          </Link>
        ))}
        <div className="nav-menu-mobile-group">
          <span className="menu-link nav-menu-mobile-link site-navbar-link nav-menu-mobile-group-label">
            Careers
          </span>
          <div className="nav-menu-mobile-submenu">
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="menu-link nav-menu-mobile-sublink site-navbar-link"
                onClick={onCloseMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/contact"
          className="cta-chip nav-menu-mobile-cta site-navbar-cta"
          onClick={onCloseMobileMenu}
        >
          Contact us
        </Link>
      </nav>
    </>
  );
}
