"use client";

import { useState } from "react";
import Link from "next/link";

type SiteHeaderProps = {
  activeItem?: "Home" | "About" | "Services" | "Careers & Talents";
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers & Talents", href: "#" },
] as const;

export function SiteHeader({ activeItem }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-main">
          <Link href="/" className="brand-mark" aria-label="Romega Solutions home">
            <span className="brand-mark-icon" aria-hidden="true">
              RS
            </span>
            <span className="brand-mark-text">Romega Solutions</span>
          </Link>

          <nav className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`menu-link ${item.label === activeItem ? "menu-link-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-cta-wrap">
            <span className="nav-cta-arrow" aria-hidden="true">
              →
            </span>
            <Link href="/services" className="cta-chip">
              Work with us
            </Link>
            <button
              type="button"
              className="nav-burger"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span className="nav-burger-line" aria-hidden="true" />
              <span className="nav-burger-line" aria-hidden="true" />
              <span className="nav-burger-line" aria-hidden="true" />
            </button>
          </div>
        </div>
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
            className={`menu-link nav-menu-mobile-link ${
              item.label === activeItem ? "menu-link-active" : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/services" className="cta-chip nav-menu-mobile-cta" onClick={() => setIsMobileMenuOpen(false)}>
          Work with us
        </Link>
      </nav>
    </header>
  );
}
