"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
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
    label: "Talent Solutions",
    href: "/services#talent-solutions",
    icon: <TalentIcon />,
    tooltip:
      "Identify, attract, and retain talent aligned with your goals and culture",
  },
  {
    label: "Executive Search",
    href: "/services#talent-solutions",
    icon: <TalentIcon />,
    tooltip:
      "Leadership search support for roles that shape long-term business direction",
  },
  {
    label: "Global Talent Sourcing",
    href: "/services#talent-solutions",
    icon: <TalentIcon />,
    tooltip:
      "Remote and global sourcing support for teams ready to scale beyond one market",
  },
  {
    label: "Workforce Planning",
    href: "/services#talent-solutions",
    icon: <TalentIcon />,
    tooltip:
      "Team structuring guidance that connects hiring needs with growth plans",
  },
  {
    label: "Brand & Growth Support",
    href: "/services#brand-growth-support",
    icon: <MarketingIcon />,
    tooltip:
      "Clarify your brand voice, value narrative, and market presence",
  },
  {
    label: "Brand Positioning",
    href: "/services#brand-growth-support",
    icon: <MarketingIcon />,
    tooltip:
      "Shape a clearer position so your audience understands why you matter",
  },
  {
    label: "Content Direction",
    href: "/services#brand-growth-support",
    icon: <MarketingIcon />,
    tooltip:
      "Communication guidance for brands that need a sharper message",
  },
  {
    label: "Strategic Operations",
    href: "/services#strategic-operations",
    icon: <WebIcon />,
    tooltip:
      "Optimize workflows, clarify processes, and align operations with growth goals",
  },
  {
    label: "Process Optimization",
    href: "/services#strategic-operations",
    icon: <WebIcon />,
    tooltip:
      "Improve the systems behind delivery so leaders can focus on impact",
  },
  {
    label: "Workflow Clarity",
    href: "/services#strategic-operations",
    icon: <WebIcon />,
    tooltip:
      "Document and simplify workflows so teams move with less friction",
  },
  {
    label: "Leadership Support",
    href: "/services#strategic-operations",
    icon: <WebIcon />,
    tooltip:
      "Practical operating support for leaders managing scale and change",
  },
];

type MarqueeLinkProps = {
  item: ServiceItem;
  onShow: (event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>, item: ServiceItem) => void;
  activeTooltipLabel: string | undefined;
  tooltipId: string;
  tabIndex?: number;
  hidden?: boolean;
};

function MarqueeLink({ item, onShow, activeTooltipLabel, tooltipId, tabIndex, hidden }: MarqueeLinkProps) {
  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => onShow(event, item),
    [item, onShow],
  );
  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => onShow(event, item),
    [item, onShow],
  );
  return (
    <Link
      className={styles.link}
      href={item.href ?? "/services"}
      title={item.tooltip}
      aria-describedby={
        activeTooltipLabel === item.label && item.tooltip ? tooltipId : undefined
      }
      tabIndex={tabIndex}
      aria-hidden={hidden}
      aria-label={item.tooltip ? `${item.label}. ${item.tooltip}` : item.label}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
      {item.label}
    </Link>
  );
}

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
  const [featuredItem, ...marqueeItems] = normalizedItems;
  const rootRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    label: string;
    text: string;
    left: number;
    bottom: number;
  } | null>(null);
  const tooltipId = useId();

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  const showTooltip = useCallback((
    event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
    item: ServiceItem,
  ) => {
    if (!item.tooltip) {
      setActiveTooltip(null);
      return;
    }

    const linkRect = event.currentTarget.getBoundingClientRect();
    const rootRect = rootRef.current?.getBoundingClientRect();
    const viewportRect = viewportRef.current?.getBoundingClientRect();

    if (!rootRect || !viewportRect) {
      setActiveTooltip(null);
      return;
    }

    const horizontalPadding = 16;
    const tooltipWidth = Math.min(
      288,
      Math.max(rootRect.width - horizontalPadding * 2, 0),
    );
    const tooltipHalfWidth = tooltipWidth / 2;
    const centeredLeft =
      linkRect.left + linkRect.width / 2 - rootRect.left;
    const minLeft = horizontalPadding + tooltipHalfWidth;
    const maxLeft = Math.max(
      rootRect.width - horizontalPadding - tooltipHalfWidth,
      minLeft,
    );

    setActiveTooltip({
      label: item.label,
      text: item.tooltip,
      left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
      bottom: rootRect.bottom - linkRect.top + 14,
    });
  }, []);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label="Service categories"
      onMouseLeave={hideTooltip}
      onBlur={hideTooltip}
    >
      {featuredItem ? (
        <div className={styles.featuredWrap}>
          <Link
            className={styles.featuredLink}
            href={featuredItem.href ?? "/services"}
            title={featuredItem.tooltip}
            aria-describedby={
              activeTooltip?.label === featuredItem.label && featuredItem.tooltip
                ? tooltipId
                : undefined
            }
            aria-label={
              featuredItem.tooltip
                ? `${featuredItem.label}. ${featuredItem.tooltip}`
                : featuredItem.label
            }
            onMouseEnter={(event) => showTooltip(event, featuredItem)}
            onFocus={(event) => showTooltip(event, featuredItem)}
          >
            {featuredItem.label}
          </Link>
        </div>
      ) : null}
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.track}>
          {marqueeItems.length > 0 ? [0, 1, 2, 3].map((groupIndex) => (
            <ul
              key={groupIndex}
              className={`${styles.group} ${groupIndex > 0 ? styles.groupDuplicate : ""}`}
              aria-hidden={groupIndex > 0}
            >
              {marqueeItems.map((item, index) => (
                <li
                  key={`${item.label}-${groupIndex}`}
                  className={styles.item}
                >
                  <MarqueeLink
                    item={item}
                    onShow={showTooltip}
                    activeTooltipLabel={activeTooltip?.label}
                    tooltipId={tooltipId}
                    tabIndex={groupIndex > 0 ? -1 : undefined}
                    hidden={groupIndex > 0}
                  />
                  {index < marqueeItems.length - 1 ? (
                    <span className={styles.separator} aria-hidden="true">
                      *
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )) : null}
        </div>
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
    </section>
  );
}
