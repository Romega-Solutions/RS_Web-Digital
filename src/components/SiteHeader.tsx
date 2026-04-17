"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNavbar, type SiteHeaderActiveItem } from "./SiteNavbar";

type SiteHeaderProps = {
  activeItem?: SiteHeaderActiveItem;
};

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

          <SiteNavbar
            activeItem={activeItem}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={() => setIsMobileMenuOpen((open) => !open)}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
