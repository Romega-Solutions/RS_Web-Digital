"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import Link from "next/link";

export type SiteHeaderActiveItem =
  | "Home"
  | "About"
  | "Services"
  | "Careers & Talents"
  | "Careers"
  | "Talent";

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
    description: "End-to-end solutions for modern growth.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Talent Solutions",
    href: "/services#talent-solutions",
    description: "Build and scale your technical team.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Brand & Growth Support",
    href: "/services#brand-growth-support",
    description: "Strengthen and elevate your presence.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    label: "Strategic Operations",
    href: "/services#strategic-operations",
    description: "Optimize processes and workflows.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.45" />
      </svg>
    ),
  },
];

const careersMenuItems = [
  {
    label: "Internal Careers",
    href: "/careers",
    description: "Join the Romega core team.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    label: "Explore Talents",
    href: "/talent",
    description: "Hire vetted global professionals.",
    icon: (
      <svg className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
];

type DropdownItemProps = {
  item: { label: string; href: string; description: string; icon: React.ReactNode };
  isActive: boolean;
  onClick: () => void;
};

function DesktopDropdownItem({ item, isActive, onClick }: DropdownItemProps) {
  return (
    <Link
      href={item.href}
      role="menuitem"
      className={`site-nav__dropdown-item ${isActive ? "site-nav__dropdown-item--active" : ""}`}
      onClick={onClick}
    >
      <div className="site-nav__dropdown-item-icon">{item.icon}</div>
      <div className="site-nav__dropdown-item-text">
        <span className="site-nav__dropdown-item-title">{item.label}</span>
        <span className="site-nav__dropdown-item-desc">{item.description}</span>
      </div>
    </Link>
  );
}

function MobileSublinkItem({ item, isActive, onClick }: DropdownItemProps) {
  return (
    <Link
      href={item.href}
      className={`site-nav__link site-nav__mobile-sublink ${isActive ? "site-nav__link--active" : ""}`}
      onClick={onClick}
    >
      <div className="site-nav__mobile-sublink-icon">{item.icon}</div>
      <div className="site-nav__mobile-sublink-text">
        <span className="site-nav__mobile-sublink-title">{item.label}</span>
        <span className="site-nav__mobile-sublink-desc">{item.description}</span>
      </div>
    </Link>
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
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(
    activeItem === "Services",
  );
  const [isMobileCareersOpen, setIsMobileCareersOpen] = useState(
    activeItem === "Careers" || activeItem === "Careers & Talents" || activeItem === "Talent",
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
      activeItem === "Careers" || activeItem === "Careers & Talents" || activeItem === "Talent",
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
      activeItem === "Careers" || activeItem === "Careers & Talents" || activeItem === "Talent",
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
              <span className="site-nav__link-text">{item.label}</span>
            </Link>
          ))}

          <div
            className="site-nav__dropdown site-nav__dropdown--services"
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
            <button
              type="button"
              className={`site-nav__link site-nav__dropdown-trigger ${
                activeItem === "Services" ? "site-nav__link--active" : ""
              }`}
              aria-expanded={isServicesDropdownOpen}
              aria-controls={servicesDropdownId}
              aria-haspopup="menu"
              onClick={() => {
                setIsServicesDropdownOpen((open) => !open);
                setIsCareersDropdownOpen(false);
              }}
            >
              <span className="site-nav__link-text">Services</span>
              <span className="site-nav__dropdown-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            <div
              id={servicesDropdownId}
              className={`site-nav__dropdown-menu ${isServicesDropdownOpen ? "site-nav__dropdown-menu--open" : ""}`}
              aria-hidden={!isServicesDropdownOpen}
              role="menu"
            >
              {servicesMenuItems.map((item) => (
                <DesktopDropdownItem
                  key={item.label}
                  item={item}
                  isActive={isHrefActive(item.href)}
                  onClick={closeServicesDropdown}
                />
              ))}
            </div>
          </div>

          <div
            className="site-nav__dropdown site-nav__dropdown--careers"
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
            <button
              type="button"
              className={`site-nav__link site-nav__dropdown-trigger ${
                activeItem === "Careers" || activeItem === "Careers & Talents" || activeItem === "Talent"
                  ? "site-nav__link--active"
                  : ""
              }`}
              aria-expanded={isCareersDropdownOpen}
              aria-controls={careersDropdownId}
              aria-haspopup="menu"
              onClick={() => {
                setIsCareersDropdownOpen((open) => !open);
                setIsServicesDropdownOpen(false);
              }}
            >
              <span className="site-nav__link-text">Careers & Talent</span>
              <span className="site-nav__dropdown-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            <div
              id={careersDropdownId}
              className={`site-nav__dropdown-menu ${isCareersDropdownOpen ? "site-nav__dropdown-menu--open" : ""}`}
              aria-hidden={!isCareersDropdownOpen}
              role="menu"
            >
              {careersMenuItems.map((item) => (
                <DesktopDropdownItem
                  key={item.label}
                  item={item}
                  isActive={isHrefActive(item.href)}
                  onClick={closeCareersDropdown}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="site-nav__cta-wrap">
          <Link href="/contact" className="site-nav__cta">
            Contact Us
            <span
              className="site-nav__cta-arrow color-white"
              aria-hidden="true"
            >
              →
            </span>
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
        ref={mobileNavRef}
        className={`site-nav__mobile ${isMobileMenuOpen ? "site-nav__mobile--open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMobileMenuOpen}
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
            className={`site-nav__link site-nav__mobile-link site-nav__mobile-group-label ${
              activeItem === "Services" ? "site-nav__link--active" : ""
            }`}
            aria-expanded={isMobileServicesOpen}
            aria-controls="mobile-services-submenu"
            onClick={() => setIsMobileServicesOpen((open) => !open)}
          >
            Services
            <span
              className={`site-nav__mobile-caret ${isMobileServicesOpen ? "site-nav__mobile-caret--open" : ""}`}
            >
              ▾
            </span>
          </button>
          <div
            id="mobile-services-submenu"
            className={`site-nav__mobile-submenu ${
              isMobileServicesOpen ? "site-nav__mobile-submenu--open" : ""
            }`}
          >
            {servicesMenuItems.map((item) => (
              <MobileSublinkItem
                key={item.label}
                item={item}
                isActive={isHrefActive(item.href)}
                onClick={handleCloseMobileMenu}
              />
            ))}
          </div>
        </div>
        
        <div className="site-nav__mobile-group">
          <button
            type="button"
            className={`site-nav__link site-nav__mobile-link site-nav__mobile-group-label ${
              activeItem === "Careers" || activeItem === "Careers & Talents" || activeItem === "Talent" ? "site-nav__link--active" : ""
            }`}
            aria-expanded={isMobileCareersOpen}
            aria-controls="mobile-careers-submenu"
            onClick={() => setIsMobileCareersOpen((open) => !open)}
          >
            Careers & Talent
            <span
              className={`site-nav__mobile-caret ${isMobileCareersOpen ? "site-nav__mobile-caret--open" : ""}`}
            >
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
              <MobileSublinkItem
                key={item.label}
                item={item}
                isActive={isHrefActive(item.href)}
                onClick={handleCloseMobileMenu}
              />
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
