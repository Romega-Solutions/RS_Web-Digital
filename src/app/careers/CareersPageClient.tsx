"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CareerJob } from "../../lib/mock-careers";

type JobsResponse = {
  jobs?: CareerJob[];
};

const cultureValues = [
  {
    title: "Reliable",
    description: "We deliver with consistency, clarity, and care.",
    icon: "/images/careers/excellence.svg",
  },
  {
    title: "Collaborative",
    description: "We work closely, share context, and build together.",
    icon: "/images/careers/people.svg",
  },
  {
    title: "Adaptable",
    description: "We move with change and stay grounded in outcomes.",
    icon: "/images/careers/growht.svg",
  },
  {
    title: "Accountable",
    description: "We own decisions and follow through on the details.",
    icon: "/images/careers/shield.svg",
  },
] as const;

const benefits = [
  {
    title: "Remote Flexibility",
    description: "Roles built for strong work across distributed teams.",
    icon: "/images/careers/world.svg",
  },
  {
    title: "Growth Exposure",
    description: "Client work that sharpens judgment and range.",
    icon: "/images/careers/books.svg",
  },
  {
    title: "Private Search",
    description: "Career conversations handled with discretion.",
    icon: "/images/careers/lock.svg",
  },
  {
    title: "Real Momentum",
    description: "Work that contributes to measurable business progress.",
    icon: "/images/careers/curiosity.svg",
  },
] as const;

const privacyFeatures = [
  { title: "Fully confidential process", icon: "/images/careers/shield.svg" },
  { title: "Your current role stays private", icon: "/images/careers/eye.svg" },
  { title: "No profile sharing without approval", icon: "/images/careers/human-check.svg" },
  { title: "Handled with a candidate-first approach", icon: "/images/careers/lock.svg" },
] as const;

export default function CareersPageClient() {
  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [jobsState, setJobsState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [jobsError, setJobsError] = useState("");

  const updatedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  async function loadJobs() {
    setJobsState("loading");
    setJobsError("");

    try {
      const response = await fetch("/api/careers/jobs", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load current opportunities.");
      }

      const payload = (await response.json()) as JobsResponse;
      const nextJobs = Array.isArray(payload.jobs) ? payload.jobs : [];
      setJobs(nextJobs);
      setJobsState("success");
    } catch (error) {
      setJobs([]);
      setJobsState("error");
      setJobsError(error instanceof Error ? error.message : "Unable to load current opportunities.");
    }
  }

  useEffect(() => {
    if (!isJobsOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    void loadJobs();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsJobsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isJobsOpen]);

  return (
    <>
      <main>
        <section className="careers-hero-section">
          <div className="careers-hero-background" aria-hidden="true">
            <Image
              src="/images/careers/bg-top.png"
              alt=""
              fill
              preload
              sizes="100vw"
              className="careers-hero-background-image"
            />
          </div>

          <div className="careers-hero-inner">
            <div className="careers-hero-grid">
              <div className="careers-hero-copy-wrap">
                <div className="careers-hero-head">
                  <p className="careers-hero-kicker">Careers at Romega Solutions</p>
                  <h1 className="careers-hero-title">Explore leadership opportunities with room to grow.</h1>
                  <p className="careers-hero-copy">
                    Find your next impactful role or stay close to future openings.
                    We work with people who move fast, think clearly, and want
                    their work to matter.
                  </p>
                  <p className="careers-hero-date">Updated: {updatedDate}</p>
                </div>

                <div className="careers-hero-actions">
                  <Link
                    href="https://www.linkedin.com/company/romega-solutions/jobs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="careers-hero-action careers-hero-action-secondary"
                  >
                    <Image src="/images/careers/human.png" alt="" width={24} height={24} />
                    <span>Stay Connected for Future Roles</span>
                  </Link>
                  <button
                    type="button"
                    className="careers-hero-action careers-hero-action-primary"
                    onClick={() => setIsJobsOpen(true)}
                  >
                    <Image src="/images/careers/bag-white.svg" alt="" width={24} height={24} />
                    <span>View Open Roles</span>
                  </button>
                </div>
              </div>

              <div className="careers-hero-media">
                <div className="careers-hero-photo-frame">
                  <Image
                    src="/prompt-images/romega-talent.png"
                    alt="Romega talent and leadership collaboration"
                    fill
                    preload
                    sizes="(max-width: 767px) 100vw, 40vw"
                    className="careers-hero-photo"
                  />
                </div>

                <div className="careers-hero-stat-card">
                  <strong>Candidate-first process</strong>
                  <p>Discreet conversations, clear next steps, and real roles you can evaluate quickly.</p>
                </div>
              </div>
            </div>

            <div className="careers-hero-columns">
              <article className="careers-info-card">
                <h2>What We&apos;re Looking For</h2>
                <ul className="careers-bullet-list">
                  <li>
                    <Image src="/images/careers/search-check.svg" alt="" width={28} height={28} />
                    <span>Leaders who think big, move with urgency, and stay accountable.</span>
                  </li>
                  <li>
                    <Image src="/images/careers/search-check.svg" alt="" width={28} height={28} />
                    <span>People who are comfortable in high-growth environments and complex client work.</span>
                  </li>
                  <li>
                    <Image src="/images/careers/search-check.svg" alt="" width={28} height={28} />
                    <span>Operators and strategists who bring strong judgment, not just activity.</span>
                  </li>
                </ul>
              </article>

              <article className="careers-info-card">
                <h2>What We Love</h2>
                <ul className="careers-bullet-list">
                  <li>
                    <Image src="/images/careers/heart-handshake.svg" alt="" width={28} height={28} />
                    <span>Connecting exceptional talent with businesses in moments of real growth.</span>
                  </li>
                  <li>
                    <Image src="/images/careers/heart-handshake.svg" alt="" width={28} height={28} />
                    <span>Supporting teams that deliver innovation across global markets.</span>
                  </li>
                  <li>
                    <Image src="/images/careers/heart-handshake.svg" alt="" width={28} height={28} />
                    <span>Helping people build careers that create visible, lasting impact.</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="careers-privacy-section" aria-labelledby="careers-privacy-title">
          <div className="careers-privacy-inner">
            <h2 id="careers-privacy-title" className="careers-section-title">
              Your Privacy, Our Priority
            </h2>
            <p className="careers-section-copy">
              We treat every career conversation with discretion. Your information
              stays secure, your current role is respected, and we do not share
              profiles without approval.
            </p>

            <div className="careers-privacy-grid">
              {privacyFeatures.map((feature) => (
                <article key={feature.title} className="careers-privacy-card">
                  <Image src={feature.icon} alt="" width={48} height={48} className="careers-privacy-icon-image" />
                  <h3>{feature.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="careers-values-section" aria-labelledby="careers-values-title">
          <div className="careers-values-inner">
            <div className="careers-values-column">
              <p className="careers-values-label">Our Culture</p>
              <h2 id="careers-values-title" className="careers-section-title">
                The Way We Work
              </h2>
              <p className="careers-section-copy">
                Great teams start with strong habits. At Romega, we value people
                who create trust, adapt well, and take ownership of outcomes.
              </p>
              <div className="careers-values-grid">
                {cultureValues.map((value) => (
                  <article key={value.title} className="careers-value-card">
                    <Image src={value.icon} alt="" width={44} height={44} className="careers-value-icon" />
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="careers-values-column">
              <p className="careers-values-label">Perks and Benefits</p>
              <h2 className="careers-section-title">What&apos;s in it for you?</h2>
              <p className="careers-section-copy">
                We build roles and partnerships that open real room for growth,
                flexibility, and meaningful client exposure.
              </p>
              <div className="careers-values-grid">
                {benefits.map((benefit) => (
                  <article key={benefit.title} className="careers-value-card">
                    <Image src={benefit.icon} alt="" width={44} height={44} className="careers-value-icon" />
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="careers-bottom-cta">
            <Link href="/contact" className="careers-bottom-link">
              Talk with Romega
            </Link>
          </div>
        </section>
      </main>

      {isJobsOpen ? (
        <div className="careers-sidebar-root" role="dialog" aria-modal="true" aria-labelledby="careers-jobs-title">
          <button
            type="button"
            className="careers-sidebar-overlay"
            aria-label="Close current roles panel"
            onClick={() => setIsJobsOpen(false)}
          />

          <aside className="careers-sidebar-panel">
            <div className="careers-sidebar-header">
              <div>
                <h2 id="careers-jobs-title">Current Roles Open</h2>
                <p>Mock data for now. Review time is typically one week.</p>
              </div>
              <button type="button" className="careers-sidebar-close" onClick={() => setIsJobsOpen(false)}>
                <Image src="/images/careers/close.svg" alt="" width={16} height={16} />
                <span>Close</span>
              </button>
            </div>

            <div className="careers-sidebar-content">
              {jobsState === "loading" || jobsState === "idle" ? (
                <p className="careers-sidebar-state">Loading current opportunities...</p>
              ) : null}

              {jobsState === "error" ? (
                <div className="careers-sidebar-state-wrap">
                  <p className="careers-sidebar-state careers-sidebar-state-error">{jobsError}</p>
                  <button type="button" className="careers-sidebar-retry" onClick={() => void loadJobs()}>
                    Try Again
                  </button>
                </div>
              ) : null}

              {jobsState === "success" && jobs.length === 0 ? (
                <p className="careers-sidebar-state">We&apos;re always growing. New opportunities coming soon.</p>
              ) : null}

              {jobsState === "success" && jobs.length > 0 ? (
                <div className="careers-job-list">
                  {jobs.map((job) => (
                    <article key={job.id} className="careers-job-card">
                      <div className="careers-job-meta">
                        <span>{job.department}</span>
                        <span>{job.type}</span>
                      </div>
                      <h3>{job.title}</h3>
                      <p className="careers-job-location">{job.location}</p>
                      <p className="careers-job-summary">{job.summary}</p>
                      <ul className="careers-job-skills">
                        {job.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                      <Link href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="careers-job-link">
                        View on LinkedIn
                      </Link>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
