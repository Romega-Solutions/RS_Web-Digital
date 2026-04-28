"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

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
] as const;

const servicesMenuItems = [
  { label: "Overview", href: "/services#services-overview" },
  { label: "Talent Solutions", href: "/services#talent-solutions" },
  { label: "Brand & Growth Support", href: "/services#brand-growth-support" },
  { label: "Strategic Operations", href: "/services#strategic-operations" },
] as const;

const careersMenuItems = [
  { label: "Talents", href: "/talent" },
] as const;

export function SiteNavbar({
  activeItem,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: SiteNavbarProps) {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(
    activeItem === "Services",
  );
  const [isMobileCareersOpen, setIsMobileCareersOpen] = useState(
    activeItem === "Careers" || activeItem === "Careers & Talents",
  );
  const [currentLocation, setCurrentLocation] = useState({
    hash: "",
    pathname: "",
  });
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const servicesDropdownCloseTimeoutRef = useRef<number | null>(null);
  const careersDropdownCloseTimeoutRef = useRef<number | null>(null);
  const servicesDropdownId = useId();
  const careersDropdownId = useId();

  const clearServicesDropdownCloseTimeout = useCallback(() => {
    if (servicesDropdownCloseTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(servicesDropdownCloseTimeoutRef.current);
    servicesDropdownCloseTimeoutRef.current = null;
  }, []);

  const clearCareersDropdownCloseTimeout = useCallback(() => {
    if (careersDropdownCloseTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(careersDropdownCloseTimeoutRef.current);
    careersDropdownCloseTimeoutRef.current = null;
  }, []);

  const openServicesDropdown = useCallback(() => {
    clearServicesDropdownCloseTimeout();
    clearCareersDropdownCloseTimeout();
    setIsCareersDropdownOpen(false);
    setIsServicesDropdownOpen(true);
  }, [clearCareersDropdownCloseTimeout, clearServicesDropdownCloseTimeout]);

  const closeServicesDropdown = useCallback(() => {
    clearServicesDropdownCloseTimeout();
    setIsServicesDropdownOpen(false);
  }, [clearServicesDropdownCloseTimeout]);

  const scheduleServicesDropdownClose = useCallback(() => {
    clearServicesDropdownCloseTimeout();
    servicesDropdownCloseTimeoutRef.current = window.setTimeout(() => {
      setIsServicesDropdownOpen(false);
      servicesDropdownCloseTimeoutRef.current = null;
    }, 120);
  }, [clearServicesDropdownCloseTimeout]);

  const openCareersDropdown = useCallback(() => {
    clearCareersDropdownCloseTimeout();
    clearServicesDropdownCloseTimeout();
    setIsServicesDropdownOpen(false);
    setIsCareersDropdownOpen(true);
  }, [clearCareersDropdownCloseTimeout, clearServicesDropdownCloseTimeout]);

  const closeCareersDropdown = useCallback(() => {
    clearCareersDropdownCloseTimeout();
    setIsCareersDropdownOpen(false);
  }, [clearCareersDropdownCloseTimeout]);

  const scheduleCareersDropdownClose = useCallback(() => {
    clearCareersDropdownCloseTimeout();
    careersDropdownCloseTimeoutRef.current = window.setTimeout(() => {
      setIsCareersDropdownOpen(false);
      careersDropdownCloseTimeoutRef.current = null;
    }, 120);
  }, [clearCareersDropdownCloseTimeout]);

  const handleCloseMobileMenu = useCallback(() => {
    onCloseMobileMenu();
    setIsMobileServicesOpen(activeItem === "Services");
    setIsMobileCareersOpen(
      activeItem === "Careers" || activeItem === "Careers & Talents",
    );
  }, [activeItem, onCloseMobileMenu]);

  const handleToggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      handleCloseMobileMenu();
      return;
    }

    onToggleMobileMenu();
    setIsMobileServicesOpen(activeItem === "Services");
    setIsMobileCareersOpen(
      activeItem === "Careers" || activeItem === "Careers & Talents",
    );
  }, [activeItem, handleCloseMobileMenu, isMobileMenuOpen, onToggleMobileMenu]);

  useAccessibleOverlay({
    isOpen: isMobileMenuOpen,
    containerRef: mobileNavRef,
    onClose: handleCloseMobileMenu,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleResize() {
      if (window.innerWidth >= 1024) {
        handleCloseMobileMenu();
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleCloseMobileMenu]);

  useEffect(() => {
    return () => {
      clearServicesDropdownCloseTimeout();
      clearCareersDropdownCloseTimeout();
    };
  }, [clearCareersDropdownCloseTimeout, clearServicesDropdownCloseTimeout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function syncLocation() {
      setCurrentLocation({
        hash: window.location.hash,
        pathname: window.location.pathname,
      });
    }

    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);

    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, []);

  const isHrefActive = useCallback(
    (href: string) => {
      const [pathname, hash = ""] = href.split("#");

      if (pathname !== currentLocation.pathname) {
        return false;
      }

      const normalizedHash = hash ? `#${hash}` : "";

      if (href === "/services#services-overview") {
        return (
          currentLocation.pathname === "/services" &&
          (currentLocation.hash === "" ||
            currentLocation.hash === "#services-overview")
        );
      }

      return currentLocation.hash === normalizedHash;
    },
    [currentLocation.hash, currentLocation.pathname],
  );

  return (
    <div className={styles.nav}>
      <div className={styles.navDesktopRow}>
        <nav className={styles.menu} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navLink} ${
                item.label === activeItem ? styles.navLinkActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div
            className={`${styles.dropdown} ${styles.dropdownServices}`}
            onMouseEnter={openServicesDropdown}
            onMouseLeave={scheduleServicesDropdownClose}
            onFocusCapture={openServicesDropdown}
            onBlurCapture={(event) => {
              const relatedTarget = event.relatedTarget as Node | null;
              if (
                !relatedTarget ||
                !event.currentTarget.contains(relatedTarget)
              ) {
                closeServicesDropdown();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeServicesDropdown();
              }
            }}
          >
            <Link
              href="/services#services-overview"
              className={`${styles.navLink} ${styles.dropdownTrigger} ${
                activeItem === "Services" ? styles.navLinkActive : ""
              }`}
              aria-expanded={isServicesDropdownOpen}
              aria-controls={servicesDropdownId}
              aria-haspopup="menu"
              role="button"
              onClick={closeServicesDropdown}
            >
              Services
              <span className={styles.dropdownCaret} aria-hidden="true">
                ▾
              </span>
            </Link>

            <div
              id={servicesDropdownId}
              className={`${styles.dropdownMenu} ${isServicesDropdownOpen ? styles.dropdownMenuOpen : ""}`}
              aria-hidden={!isServicesDropdownOpen}
              role="menu"
            >
              {servicesMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={`${styles.dropdownItem} ${
                    isHrefActive(item.href)
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={closeServicesDropdown}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className={`${styles.dropdown} ${styles.dropdownCareers}`}
            onMouseEnter={openCareersDropdown}
            onMouseLeave={scheduleCareersDropdownClose}
            onFocusCapture={openCareersDropdown}
            onBlurCapture={(event) => {
              const relatedTarget = event.relatedTarget as Node | null;
              if (
                !relatedTarget ||
                !event.currentTarget.contains(relatedTarget)
              ) {
                closeCareersDropdown();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeCareersDropdown();
              }
            }}
          >
            <Link
              href="/careers"
              className={`${styles.navLink} ${styles.dropdownTrigger} ${
                activeItem === "Careers" || activeItem === "Careers & Talents"
                  ? styles.navLinkActive
                  : ""
              }`}
              aria-expanded={isCareersDropdownOpen}
              aria-controls={careersDropdownId}
              aria-haspopup="menu"
              role="button"
              onClick={closeCareersDropdown}
            >
              Careers
              <span className={styles.dropdownCaret} aria-hidden="true">
                ▾
              </span>
            </Link>

            <div
              id={careersDropdownId}
              className={`${styles.dropdownMenu} ${isCareersDropdownOpen ? styles.dropdownMenuOpen : ""}`}
              aria-hidden={!isCareersDropdownOpen}
              role="menu"
            >
              {careersMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={`${styles.dropdownItem} ${
                    isHrefActive(item.href)
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={closeCareersDropdown}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.ctaWrap}>
          <Link href="/contact" className={styles.cta}>
            Contact Us
            <span
              className={styles.ctaArrow}
              aria-hidden="true"
            >
              →
            </span>
          </Link>
          <button
            type="button"
            className={`${styles.burger} ${isMobileMenuOpen ? styles.burgerOpen : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={handleToggleMobileMenu}
          >
            <span className={styles.burgerLine} aria-hidden="true" />
            <span className={styles.burgerLine} aria-hidden="true" />
            <span className={styles.burgerLine} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className={styles.mobileOverlay}
          aria-label="Close navigation menu"
          onClick={handleCloseMobileMenu}
        />
      ) : null}

      <nav
        id="mobile-nav-menu"
        ref={mobileNavRef}
        className={`${styles.mobile} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMobileMenuOpen}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navLink} ${styles.mobileLink} ${
              item.label === activeItem ? styles.navLinkActive : ""
            }`}
            onClick={handleCloseMobileMenu}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.mobileGroup}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.mobileLink} ${styles.mobileGroupLabel} ${
              activeItem === "Services" ? styles.navLinkActive : ""
            }`}
            aria-expanded={isMobileServicesOpen}
            aria-controls="mobile-services-submenu"
            onClick={() => setIsMobileServicesOpen((open) => !open)}
          >
            Services
            <span
              className={`${styles.mobileCaret} ${isMobileServicesOpen ? styles.mobileCaretOpen : ""}`}
            >
              ▾
            </span>
          </button>
          <div
            id="mobile-services-submenu"
            className={`${styles.mobileSubmenu} ${
              isMobileServicesOpen ? styles.mobileSubmenuOpen : ""
            }`}
          >
            {servicesMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${styles.mobileSublink} ${
                  isHrefActive(item.href) ? styles.navLinkActive : ""
                }`}
                onClick={handleCloseMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mobileGroup}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.mobileLink} ${styles.mobileGroupLabel}`}
            aria-expanded={isMobileCareersOpen}
            aria-controls="mobile-careers-submenu"
            onClick={() => setIsMobileCareersOpen((open) => !open)}
          >
            Careers
            <span
              className={`${styles.mobileCaret} ${isMobileCareersOpen ? styles.mobileCaretOpen : ""}`}
            >
              ▾
            </span>
          </button>
          <div
            id="mobile-careers-submenu"
            className={`${styles.mobileSubmenu} ${
              isMobileCareersOpen ? styles.mobileSubmenuOpen : ""
            }`}
          >
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${styles.mobileSublink}`}
                onClick={handleCloseMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/contact"
          className={`${styles.cta} ${styles.mobileCta}`}
          onClick={handleCloseMobileMenu}
        >
          Contact Us
        </Link>
      </nav>
    </div>
  );
}
