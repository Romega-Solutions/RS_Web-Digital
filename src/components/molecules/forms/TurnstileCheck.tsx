"use client";

import Link from "next/link";
import type { RefObject } from "react";
import styles from "./TurnstileCheck.module.css";
import { TURNSTILE_NOTICE, splitAtAddress } from "@/lib/turnstile/messages";

type SlotProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  interactive: boolean;
  // True while a check is running, and while the form is sent after it passed.
  checking: boolean;
  sending: boolean;
};

// Where Cloudflare may draw its box. With "interaction-only" it stays empty and
// takes no room unless a visitor really has to do something.
export function TurnstileSlot({ containerRef, interactive, checking, sending }: SlotProps) {
  // Read out by screen readers as the check moves along.
  const liveMessage = interactive
    ? "Please tick the box to continue."
    : checking
      ? "Running a quick security check."
      : sending
        ? "Check passed, sending."
        : "";
  return (
    <>
      {interactive ? <p className={styles.prompt}>Please tick the box to continue.</p> : null}
      <div
        ref={containerRef}
        role="group"
        aria-label="Security check"
        tabIndex={-1}
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
