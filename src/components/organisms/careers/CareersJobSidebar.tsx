import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import type { CareerJob } from "@/lib/mock-careers";
import styles from "./CareersJobSidebar.module.css";

interface CareersJobSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: CareerJob[];
  state: "idle" | "loading" | "success" | "error";
  error: string;
  onRetry: () => void;
}

export function CareersJobSidebar({
  isOpen,
  onClose,
  jobs,
  state,
  error,
  onRetry,
}: CareersJobSidebarProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use microtask to avoid synchronous state update in effect
      const animationFrame = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      return () => cancelAnimationFrame(animationFrame);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useAccessibleOverlay({
    isOpen,
    containerRef: panelRef,
    onClose,
  });

  const shouldRender = isOpen || isAnimating;

  if (!shouldRender) return null;

  return (
    <div className={`${styles.root} ${isOpen ? styles.rootOpen : ""}`}>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-panel-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="jobs-panel-title">Current Opportunities</h2>
            <p>Direct placements and contract roles handled with discretion.</p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close opportunities panel"
          >
            <Image
              src="/images/careers/close.svg"
              alt=""
              width={20}
              height={20}
            />
          </button>
        </div>

        <div className={styles.content}>
          {state === "loading" && (
            <div className={styles.stateWrap}>
              <div className="flex space-x-2">
                <div className="h-3 w-3 animate-bounce rounded-full bg-brand-secondary [animation-delay:-0.3s]" />
                <div className="h-3 w-3 animate-bounce rounded-full bg-brand-secondary [animation-delay:-0.15s]" />
                <div className="h-3 w-3 animate-bounce rounded-full bg-brand-secondary" />
              </div>
              <p className={styles.state}>Loading the latest roles...</p>
            </div>
          )}

          {state === "error" && (
            <div className={styles.stateWrap}>
              <div className="rounded-full bg-red-50 p-4">
                <Image src="/images/careers/lock.svg" alt="" width={40} height={40} className="opacity-60" />
              </div>
              <p className={`${styles.state} ${styles.stateError}`}>{error}</p>        
              <button
                type="button"
                className={styles.retry}
                onClick={onRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {state === "success" && jobs.length === 0 && (
            <div className={styles.stateWrap}>
              <div className="rounded-full bg-brand-secondary/5 p-6">
                <Image src="/images/careers/human-check.svg" alt="" width={48} height={48} className="opacity-40" />
              </div>
              <p className={styles.state}>
                We don&apos;t have any active public listings right now, but we        
                are always looking for talent. Send us your profile!
              </p>
              <div className="mt-4">
                <AppButton href="mailto:careers@romega-solutions.com" variant="outline">
                  Send Your Profile
                </AppButton>
              </div>
            </div>
          )}

          {state === "success" && jobs.length > 0 && (
            <ul className={styles.list}>
              {jobs.map((job) => (
                <li key={job.id}>
                  <article className={styles.card}>
                    <div className={styles.meta}>
                      <span>{job.department}</span>
                      <span className="opacity-30">•</span>
                      <span>{job.type}</span>
                    </div>
                    <h3 className="mt-3">{job.title}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Image src="/images/careers/world.svg" alt="" width={16} height={16} className="opacity-40" />
                      <p className={styles.location}>{job.location}</p>
                    </div>
                    <p className={styles.summary}>{job.summary}</p>
                    {job.skills && job.skills.length > 0 && (
                      <ul className={styles.skills}>
                        {job.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href={`/careers/${job.id}`}
                      className={styles.jobLink}
                    >
                      View Role Details
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

interface AppButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
}

function AppButton({ children, href, onClick, variant = "primary" }: AppButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-bold transition-all duration-200 cursor-pointer";
  const variants = {
    primary: "bg-brand-secondary text-white hover:bg-brand-secondary/90 hover:shadow-lg",
    outline: "border-2 border-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary hover:text-white hover:border-brand-secondary",
  };
  
  const className = `${baseClasses} ${variants[variant]}`;

  if (href) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} className={className}>{children}</button>;
}
