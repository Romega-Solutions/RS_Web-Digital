"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavbar, type SiteHeaderActiveItem } from "./SiteNavbar";

type SiteHeaderProps = {
  activeItem?: SiteHeaderActiveItem;
};

export function SiteHeader({ activeItem }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rootStyle = document.documentElement.style;
    const syncHeaderHeight = () => {
      const height = headerRef.current?.getBoundingClientRect().height;
      if (!height) {
        return;
      }
      rootStyle.setProperty("--site-header-height", `${Math.ceil(height)}px`);
    };

    syncHeaderHeight();

    const observer = new ResizeObserver(syncHeaderHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((open) => !open);
  }, []);
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header ref={headerRef} className="site-header">
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
            <span className="site-header__brand-text">ROMEGA SOLUTIONS</span>
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
