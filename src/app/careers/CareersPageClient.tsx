"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CareersHero } from "@/components/organisms/careers/CareersHero";
import { CareersValuesSection } from "@/components/organisms/careers/CareersValuesSection";
import { CareersPrivacySection } from "@/components/organisms/careers/CareersPrivacySection";
import { CareersJobSidebar } from "@/components/organisms/careers/CareersJobSidebar";
import type { CareerJob } from "@/lib/mock-careers";

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

  const loadJobs = useCallback(async () => {
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
      setJobsState("error");
      setJobsError(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  }, []);

  const openJobs = useCallback(() => {
    setIsJobsOpen(true);
    if (jobsState === "idle") {
      loadJobs();
    }
  }, [jobsState, loadJobs]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const triggerFromHash = () => {
      if (window.location.hash === "#open-opportunities") {
        window.setTimeout(() => {
          openJobs();
        }, 120);
      }

      if (window.location.hash === "#send-profile") {
        window.setTimeout(() => {
          window.location.href = "mailto:careers@romega-solutions.com";
        }, 120);
      }
    };

    triggerFromHash();
    window.addEventListener("hashchange", triggerFromHash);
    return () => window.removeEventListener("hashchange", triggerFromHash);
  }, [openJobs]);

  return (
    <>
      <CareersHero updatedDate={updatedDate} onOpenJobs={openJobs} />

      <CareersValuesSection cultureValues={cultureValues} benefits={benefits} />

      <CareersPrivacySection privacyFeatures={privacyFeatures} onOpenJobs={openJobs} />

      <CareersJobSidebar
        isOpen={isJobsOpen}
        onClose={() => setIsJobsOpen(false)}
        jobs={jobs}
        state={jobsState}
        error={jobsError}
        onRetry={loadJobs}
      />
    </>
  );
}
