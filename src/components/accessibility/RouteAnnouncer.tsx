"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function getPageAnnouncement() {
  const heading = document.querySelector("main h1");
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim();
  }

  if (document.title) {
    return document.title;
  }

  return "Page updated";
}

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activeDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!activeDialog) {
        const main = document.getElementById("main-content");
        if (main instanceof HTMLElement) {
          main.focus({ preventScroll: true });
        }
      }

      setAnnouncement(getPageAnnouncement());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}
