import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
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

  useAccessibleOverlay({
    isOpen,
    containerRef: panelRef,
    onClose,
  });

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
            <p>Direct placements and contract roles.</p>
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
              width={16}
              height={16}
            />
          </button>
        </div>

        <div className={styles.content}>
          {state === "loading" && (
            <div className={styles.stateWrap}>
              <p className={styles.state}>Loading latest roles...</p>
            </div>
          )}

          {state === "error" && (
            <div className={styles.stateWrap}>
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
              <p className={styles.state}>
                We don&apos;t have any active public listings right now, but we
                are always looking for talent. Send us your profile!
              </p>
            </div>
          )}

          {state === "success" && jobs.length > 0 && (
            <ul className={styles.list}>
              {jobs.map((job) => (
                <li key={job.id}>
                  <article className={styles.card}>
                    <div className={styles.meta}>
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                    <h3 className="mt-2">{job.title}</h3>
                    <p className={styles.location}>{job.location}</p>
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
