"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavbar, type SiteHeaderActiveItem } from "./SiteNavbar";

type SiteHeaderProps = {
  activeItem?: SiteHeaderActiveItem;
};

export function SiteHeader({ activeItem }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((open) => !open);
  }, []);
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__main">
          <Link href="/" className="site-header__brand" aria-label="Romega Solutions home">
            <span className="site-header__brand-icon" aria-hidden="true">
              <Image
                src="/RS_Logo-Blue.png"
                alt=""
                width={1601}
                height={1600}
                className="site-header__brand-logo"
                preload
              />
            </span>
            <span className="site-header__brand-text">Romega Solutions</span>
          </Link>

          <SiteNavbar
            activeItem={activeItem}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={handleToggleMobileMenu}
            onCloseMobileMenu={handleCloseMobileMenu}
          />
        </div>
      </div>
    </header>
  );
}
