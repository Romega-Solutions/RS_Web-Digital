"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { AppButton } from "@/components/atoms/Button";
import {
  acceptClarity,
  declineClarity,
  claritySnippet,
  isBannerCloseKey,
  readConsent,
  shouldLoadClarity,
  type ClarityConsent,
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

export default function ClarityConsentBanner({ projectId }: { projectId: string }) {
  // The server render has no stored choice to read, so it shows nothing and
  // loads nothing. A stored choice of either kind keeps the banner hidden.
  const stored = useSyncExternalStore<ClarityConsent | null | "unknown">(
    subscribe,
    () => readConsent(storage()),
    () => "unknown",
  );
  const [acceptedNow, setAcceptedNow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const load = stored !== "unknown" && shouldLoadClarity(stored, acceptedNow);
  const open = stored === null && !acceptedNow && !dismissed;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (isBannerCloseKey(event.key)) setDismissed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const tag = load ? (
    <Script id="ms-clarity" strategy="afterInteractive">
      {claritySnippet(projectId)}
    </Script>
  ) : null;

  if (!open) return tag;

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
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          className={styles.mobileFull}
          onClick={() => {
            declineClarity(storage());
            setDismissed(true);
          }}
        >
          Decline
        </AppButton>
        <AppButton
          type="button"
          variant="primary"
          size="sm"
          className={styles.mobileFull}
          onClick={() => {
            acceptClarity(storage());
            setAcceptedNow(true);
          }}
        >
          Accept
        </AppButton>
      </div>
    </section>
  );
}
