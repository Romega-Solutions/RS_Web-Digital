"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { FocusEvent, MouseEvent, ReactNode } from "react";
import styles from "./ServiceStrip.module.css";

type ServiceItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  tooltip?: string;
};

type ServiceStripProps = {
  items?: Array<string | ServiceItem>;
};

const TalentIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MarketingIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6" />
  </svg>
);

const WebIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M2 17h20" />
    <path d="M6 20h12" />
  </svg>
);

const defaultItems: ServiceItem[] = [
  {
    label: "Our Services",
    href: "/services#services-overview",
    tooltip:
      "Explore our full range of services designed to accelerate your growth",
  },
  {
    label: "Talent Acquisition",
    href: "/services#talent-solutions",
    icon: <TalentIcon />,
    tooltip:
      "Building expert teams across engineering, product, sales, and operations",
  },
  {
    label: "Digital Marketing",
    href: "/services#brand-growth-support",
    icon: <MarketingIcon />,
    tooltip:
      "Strategic brand development and market positioning to reach your audience",
  },
  {
    label: "Website Development",
    href: "/services#strategic-operations",
    icon: <WebIcon />,
    tooltip: "Custom web solutions that drive engagement and conversions",
  },
];

function normalizeItems(items: Array<string | ServiceItem>): ServiceItem[] {
  return items.map((item) => {
    if (typeof item === "string") {
      return { label: item, href: "/services", icon: undefined };
    }

    return {
      label: item.label,
      href: item.href ?? "/services",
      icon: item.icon,
      tooltip: item.tooltip,
    };
  });
}

export function ServiceStrip({ items = defaultItems }: ServiceStripProps) {
  const normalizedItems = normalizeItems(items);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    label: string;
    text: string;
    left: number;
    bottom: number;
  } | null>(null);
  const tooltipId = useId();

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const showTooltip = (
    event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
    item: ServiceItem,
  ) => {
    if (!item.tooltip) {
      setActiveTooltip(null);
      return;
    }

    const linkRect = event.currentTarget.getBoundingClientRect();
    const viewportRect = viewportRef.current?.getBoundingClientRect();

    if (!viewportRect) {
      setActiveTooltip(null);
      return;
    }

    const horizontalPadding = 16;
    const tooltipWidth = Math.min(
      288,
      Math.max(viewportRect.width - horizontalPadding * 2, 0),
    );
    const tooltipHalfWidth = tooltipWidth / 2;
    const centeredLeft =
      linkRect.left + linkRect.width / 2 - viewportRect.left;
    const minLeft = horizontalPadding + tooltipHalfWidth;
    const maxLeft = Math.max(
      viewportRect.width - horizontalPadding - tooltipHalfWidth,
      minLeft,
    );

    setActiveTooltip({
      label: item.label,
      text: item.tooltip,
      left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
      bottom: viewportRect.bottom - linkRect.top + 14,
    });
  };

  return (
    <section
      className={styles.root}
      aria-label="Service categories"
      onMouseLeave={hideTooltip}
      onBlur={hideTooltip}
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.track}>
          {[0, 1].map((groupIndex) => (
            <ul
              key={groupIndex}
              className={`${styles.group} ${groupIndex === 1 ? styles.groupDuplicate : ""}`}
              aria-hidden={groupIndex === 1}
            >
              {normalizedItems.map((item, index) => (
                <li
                  key={`${item.label}-${groupIndex}`}
                  className={styles.item}
                >
                  <Link
                    className={styles.link}
                    href={item.href ?? "/services"}
                    title={item.tooltip}
                    aria-describedby={
                      activeTooltip?.label === item.label && item.tooltip
                        ? tooltipId
                        : undefined
                    }
                    tabIndex={groupIndex === 1 ? -1 : undefined}
                    aria-hidden={groupIndex === 1}
                    aria-label={
                      item.tooltip
                        ? `${item.label}. ${item.tooltip}`
                        : item.label
                    }
                    onMouseEnter={(event) => showTooltip(event, item)}
                    onFocus={(event) => showTooltip(event, item)}
                  >
                    {item.icon && (
                      <span className={styles.iconWrapper}>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </Link>
                  {index < normalizedItems.length - 1 ? (
                    <span
                      className={styles.separator}
                      aria-hidden="true"
                    >
                      *
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ))}
        </div>
        {activeTooltip ? (
          <div
            id={tooltipId}
            className={styles.tooltip}
            role="tooltip"
            style={{
              left: `${activeTooltip.left}px`,
              bottom: `${activeTooltip.bottom}px`,
            }}
          >
            {activeTooltip.text}
          </div>
        ) : null}
      </div>
    </section>
  );
}
