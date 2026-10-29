"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  acceptClarity,
  declineClarity,
  isBannerCloseKey,
  readConsent,
  type ClarityWindow,
} from "@/lib/analytics/clarity";
import styles from "./ClarityConsentBanner.module.css";

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

// The stored choice only changes through this banner, so there is nothing to subscribe to.
const subscribe = () => () => {};

export default function ClarityConsentBanner() {
  // A stored "accepted" is re-sent by the tag itself; a stored choice of either
  // kind keeps the banner hidden. The server render never shows it.
  const hasChoice = useSyncExternalStore(
    subscribe,
    () => readConsent(storage()) !== null,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);
  const open = !hasChoice && !dismissed;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (isBannerCloseKey(event.key)) setDismissed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <section
      className={styles.banner}
      role="region"
      aria-label="Analytics consent"
      aria-describedby="clarity-consent-text"
    >
      <p id="clarity-consent-text" className={styles.text}>
        May we use Microsoft Clarity to see how visitors use this site? It records clicks and
        scrolling, with form fields hidden. See our{" "}
        <Link href="/privacy" className={styles.link}>
          Privacy Policy
        </Link>
        .
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.decline}
          onClick={() => {
            declineClarity(storage());
            setDismissed(true);
          }}
        >
          Decline
        </button>
        <button
          type="button"
          className={styles.accept}
          onClick={() => {
            acceptClarity(window as unknown as ClarityWindow, storage());
            setDismissed(true);
          }}
        >
          Accept
        </button>
      </div>
    </section>
  );
}
