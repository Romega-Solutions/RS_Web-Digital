"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import Link from "next/link";
import styles from "./SiteNavbar.module.css";

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
  { label: "About", href: "/about" },
] as const;

const servicesMenuItems = [
  { 
    label: "Overview", 
    href: "/services#services-overview",
    description: "Strategic growth support for your business.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    )
  },
  { 
    label: "Talent Solutions", 
    href: "/services#talent-solutions",
    description: "Build teams aligned with your long-term vision.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  { 
    label: "Brand & Growth", 
    href: "/services#brand-growth-support",
    description: "Clarify your message and build brand trust.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    )
  },
  { 
    label: "Strategic Ops", 
    href: "/services#strategic-operations",
    description: "Optimize workflows for scalable success.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    )
  },
] as const;

const careersMenuItems = [
  {
    label: "Careers Page",
    href: "/careers",
    description: "Learn about the role, culture, and hiring process.",
    isChild: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>
      </svg>
    )
  },
  {
    label: "View Open Opportunities",
    href: "/careers#open-opportunities",
    description: "Open the current roles panel on the careers page.",
    isChild: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18"/><path d="M8 3v4"/><path d="M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 11h8"/><path d="M8 15h5"/>
      </svg>
    )
  },
  {
    label: "Send Your Profile",
    href: "mailto:careers@romega-solutions.com",
    description: "Open your mail app and send your profile directly.",
    isChild: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/><path d="M8 11h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/>
      </svg>
    )
  },
  { 
    label: "Talent Pool", 
    href: "/talent",
    description: "Browse our curated pool of professionals.",
    isChild: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
] as const;

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  );
}

export function SiteNavbar({
  activeItem,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: SiteNavbarProps) {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(activeItem === "Services");
  const [isMobileCareersOpen, setIsMobileCareersOpen] = useState(activeItem === "Careers" || activeItem === "Careers & Talents");
  const [currentLocation, setCurrentLocation] = useState({ hash: "", pathname: "" });
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const servicesDropdownCloseTimeoutRef = useRef<number | null>(null);
  const careersDropdownCloseTimeoutRef = useRef<number | null>(null);
  const servicesDropdownId = useId();
  const careersDropdownId = useId();

  const clearServicesDropdownCloseTimeout = useCallback(() => {
    if (servicesDropdownCloseTimeoutRef.current === null) return;
    window.clearTimeout(servicesDropdownCloseTimeoutRef.current);
    servicesDropdownCloseTimeoutRef.current = null;
  }, []);

  const clearCareersDropdownCloseTimeout = useCallback(() => {
    if (careersDropdownCloseTimeoutRef.current === null) return;
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

  const handleServicesDropdownBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        closeServicesDropdown();
      }
    },
    [closeServicesDropdown],
  );

  const handleServicesDropdownKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        closeServicesDropdown();
      }
    },
    [closeServicesDropdown],
  );

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

  const handleCareersDropdownBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        closeCareersDropdown();
      }
    },
    [closeCareersDropdown],
  );

  const handleCareersDropdownKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        closeCareersDropdown();
      }
    },
    [closeCareersDropdown],
  );

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
    setIsMobileCareersOpen(activeItem === "Careers" || activeItem === "Careers & Talents");
  }, [activeItem, onCloseMobileMenu]);

  const handleToggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      handleCloseMobileMenu();
      return;
    }
    onToggleMobileMenu();
    setIsMobileServicesOpen(activeItem === "Services");
    setIsMobileCareersOpen(activeItem === "Careers" || activeItem === "Careers & Talents");
  }, [activeItem, handleCloseMobileMenu, isMobileMenuOpen, onToggleMobileMenu]);

  useAccessibleOverlay({
    isOpen: isMobileMenuOpen,
    containerRef: mobileNavRef,
    onClose: handleCloseMobileMenu,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleResize() {
      if (window.innerWidth >= 1024) handleCloseMobileMenu();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleCloseMobileMenu]);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
      if (pathname !== currentLocation.pathname) return false;
      const normalizedHash = hash ? `#${hash}` : "";
      if (href === "/services#services-overview") {
        return currentLocation.pathname === "/services" && (currentLocation.hash === "" || currentLocation.hash === "#services-overview");
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
              className={`${styles.navLink} ${item.label === activeItem ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}

          <div
            className={`${styles.dropdown} ${styles.dropdownServices} ${isServicesDropdownOpen ? styles.dropdownOpen : ""}`}
            onMouseEnter={openServicesDropdown}
            onMouseLeave={scheduleServicesDropdownClose}
            onFocus={openServicesDropdown}
            onBlur={handleServicesDropdownBlur}
            onKeyDown={handleServicesDropdownKeyDown}
          >
            <Link
              href="/services#services-overview"
              className={`${styles.navLink} ${styles.dropdownTrigger} ${activeItem === "Services" ? styles.navLinkActive : ""}`}
              aria-expanded={isServicesDropdownOpen}
              aria-controls={servicesDropdownId}
              aria-haspopup="menu"
              role="button"
            >
              Services
              <span className={styles.dropdownCaret} aria-hidden="true"><ChevronDown /></span>
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
                  className={`${styles.dropdownItem} ${isHrefActive(item.href) ? styles.dropdownItemActive : ""}`}
                  onClick={closeServicesDropdown}
                >
                  <span className={styles.dropdownItemIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.dropdownItemContent}>
                    <span className={styles.dropdownItemTitle}>{item.label}</span>
                    <span className={styles.dropdownItemDesc}>{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div
            className={`${styles.dropdown} ${styles.dropdownCareers} ${isCareersDropdownOpen ? styles.dropdownOpen : ""}`}
            onMouseEnter={openCareersDropdown}
            onMouseLeave={scheduleCareersDropdownClose}
            onFocus={openCareersDropdown}
            onBlur={handleCareersDropdownBlur}
            onKeyDown={handleCareersDropdownKeyDown}
          >
            <Link
              href="/careers"
              className={`${styles.navLink} ${styles.dropdownTrigger} ${activeItem === "Careers" || activeItem === "Careers & Talents" ? styles.navLinkActive : ""}`}
              aria-expanded={isCareersDropdownOpen}
              aria-controls={careersDropdownId}
              aria-haspopup="menu"
              role="button"
            >
              Careers & Talents
              <span className={styles.dropdownCaret} aria-hidden="true"><ChevronDown /></span>
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
                  className={`${styles.dropdownItem} ${item.isChild ? styles.dropdownItemChild : ""} ${isHrefActive(item.href) ? styles.dropdownItemActive : ""}`}
                  onClick={closeCareersDropdown}
                >
                  <span className={styles.dropdownItemIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.dropdownItemContent}>
                    <span className={styles.dropdownItemTitle}>{item.label}</span>
                    <span className={styles.dropdownItemDesc}>{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.ctaWrap}>
          <Link href="/contact" className={styles.cta}>
            Contact Us <span className={styles.ctaArrow} aria-hidden="true"><ArrowRight /></span>
          </Link>
          <button
            type="button"
            className={`${styles.burger} ${isMobileMenuOpen ? styles.burgerOpen : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={handleToggleMobileMenu}
          >
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={handleCloseMobileMenu} aria-hidden="true" />
      )}

      <nav
        ref={mobileNavRef}
        className={`${styles.mobile} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navLink} ${styles.mobileLink} ${item.label === activeItem ? styles.navLinkActive : ""}`}
            onClick={handleCloseMobileMenu}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.mobileGroup}>
          <button
            type="button"
            className={`${styles.mobileLink} ${styles.mobileGroupLabel}`}
            onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
          >
            Services <span className={`${styles.mobileCaret} ${isMobileServicesOpen ? styles.mobileCaretOpen : ""}`}><ChevronDown /></span>
          </button>
          <div className={`${styles.mobileSubmenu} ${isMobileServicesOpen ? styles.mobileSubmenuOpen : ""}`}>
            {servicesMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileSublink} ${isHrefActive(item.href) ? styles.navLinkActive : ""}`}
                onClick={handleCloseMobileMenu}
              >
                <span className={styles.mobileSublinkIcon} aria-hidden="true">{item.icon}</span>
                <span className={styles.mobileSublinkText}>
                  <span className={styles.mobileSublinkTitle}>{item.label}</span>
                  <span className={styles.mobileSublinkDesc}>{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mobileGroup}>
          <button
            type="button"
            className={`${styles.mobileLink} ${styles.mobileGroupLabel}`}
            onClick={() => setIsMobileCareersOpen(!isMobileCareersOpen)}
          >
            Careers & Talents <span className={`${styles.mobileCaret} ${isMobileCareersOpen ? styles.mobileCaretOpen : ""}`}><ChevronDown /></span>
          </button>
          <div className={`${styles.mobileSubmenu} ${isMobileCareersOpen ? styles.mobileSubmenuOpen : ""}`}>
            {careersMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileSublink} ${item.isChild ? styles.mobileSublinkChild : ""} ${isHrefActive(item.href) ? styles.navLinkActive : ""}`}
                onClick={handleCloseMobileMenu}
              >
                <span className={styles.mobileSublinkIcon} aria-hidden="true">{item.icon}</span>
                <span className={styles.mobileSublinkText}>
                  <span className={styles.mobileSublinkTitle}>{item.label}</span>
                  <span className={styles.mobileSublinkDesc}>{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <Link href="/contact" className={`${styles.cta} ${styles.mobileCta}`} onClick={handleCloseMobileMenu}>
          Contact Us
        </Link>
      </nav>
    </div>
  );
}
