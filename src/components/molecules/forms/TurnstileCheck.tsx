"use client";

import Link from "next/link";
import type { RefObject } from "react";
import styles from "./TurnstileCheck.module.css";
import { TURNSTILE_NOTICE, splitAtAddress } from "@/lib/turnstile/messages";

type SlotProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  interactive: boolean;
  // The text read out by screen readers while the check runs.
  liveMessage: string;
};

// Where Cloudflare may draw its box. With "interaction-only" it stays empty and
// takes no room unless a visitor really has to do something.
export function TurnstileSlot({ containerRef, interactive, liveMessage }: SlotProps) {
  return (
    <>
      <div
        ref={containerRef}
        role="group"
        aria-label="Security check"
        className={`${styles.slot} ${interactive ? styles.slotOpen : ""}`}
      />
      <p role="status" aria-live="polite" className={styles.live}>
        {liveMessage}
      </p>
    </>
  );
}

export function TurnstileNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`${styles.notice} ${className}`.trim()}>
      {TURNSTILE_NOTICE} <Link href="/privacy">Privacy policy</Link>
    </p>
  );
}

// A message that names an email address, with the address turned into a link.
export function MailLinkedMessage({
  message,
  address,
  subject,
}: {
  message: string;
  address: string;
  subject?: string;
}) {
  const parts = splitAtAddress(message, address);
  if (!parts) return <>{message}</>;
  const href = `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <>
      {parts[0]}
      <a href={href}>{parts[1]}</a>
      {parts[2]}
    </>
  );
}
