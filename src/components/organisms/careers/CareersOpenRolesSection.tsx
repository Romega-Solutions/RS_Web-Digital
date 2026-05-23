"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CareerJob } from "@/types/careers";
import styles from "./CareersOpenRolesSection.module.css";

interface CareersOpenRolesSectionProps {
  jobs: CareerJob[];
}

const ALL_LOCATIONS = "all";

export function CareersOpenRolesSection({ jobs }: CareersOpenRolesSectionProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<string>(ALL_LOCATIONS);

  const locations = useMemo(() => {
    const unique = new Set<string>();
    for (const job of jobs) {
      if (job.location) unique.add(job.location);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (location !== ALL_LOCATIONS && job.location !== location) return false;
      if (!needle) return true;
      const haystack = [job.title, job.department, job.location, job.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [jobs, query, location]);

  const total = jobs.length;
  const showing = filtered.length;

  return (
    <section id="open-roles" className={styles.root} aria-labelledby="open-roles-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Open Opportunities</p>
          <h2 id="open-roles-title" className={styles.title}>
            {total > 0
              ? `We're hiring${total === 1 ? "" : ` for ${total} roles`}`
              : "Currently between active roles"}
          </h2>
          <p className={styles.lead}>
            {total > 0
              ? "Pick a role below to view the brief and submit your application — every form lands directly with our recruitment team."
              : "We're always looking for strong people. Send your profile and we'll be in touch when something fits."}
          </p>
        </header>

        {total > 0 && (
          <div className={styles.toolbar} role="search">
            <label className={styles.searchField}>
              <span className="sr-only">Search roles</span>
              <span aria-hidden="true" className={styles.searchIcon}>
                🔍
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, team, or skill"
                className={styles.searchInput}
              />
            </label>

            {locations.length > 1 && (
              <label className={styles.filterField}>
                <span className="sr-only">Filter by location</span>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className={styles.select}
                >
                  <option value={ALL_LOCATIONS}>All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <p className={styles.count} aria-live="polite">
              {showing === total
                ? `${total} ${total === 1 ? "role" : "roles"}`
                : `${showing} of ${total}`}
            </p>
          </div>
        )}

        {total === 0 ? (
          <div className={styles.empty}>
            <p>No active public listings right now.</p>
            <a href="mailto:info@romega-solutions.com" className={styles.emptyCta}>
              Send your profile →
            </a>
          </div>
        ) : showing === 0 ? (
          <div className={styles.empty}>
            <p>No roles match your filters.</p>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setQuery("");
                setLocation(ALL_LOCATIONS);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((job) => (
              <li key={job.id}>
                <article className={styles.card} id={`role-${job.id}`}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardMeta}>
                      <span>{job.department}</span>
                      <span aria-hidden="true" className={styles.dot}>
                        •
                      </span>
                      <span>{job.location}</span>
                      <span aria-hidden="true" className={styles.dot}>
                        •
                      </span>
                      <span>{job.type}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{job.title}</h3>
                  </div>
                  {job.summary && <p className={styles.cardSummary}>{job.summary}</p>}
                  <div className={styles.cardActions}>
                    <Link href={job.applyUrl} className={styles.applyButton}>
                      Apply now
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
