import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ConsultationBanner } from "../../components/ConsultationBanner";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "About | Romega Solutions",
  description: "Learn what Romega Solutions is built on and the people-first approach behind its growth.",
};

export default function AboutPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader activeItem="About" />

      <main>
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-hero-photo-frame">
              <Image
                src="/2.0%20Website%20Assets/2.png"
                alt="Romega team collaborating around a table"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 36vw"
                className="about-hero-photo"
              />
            </div>

            <div className="about-hero-copy">
              <h1 className="about-hero-title">
                Built on <span className="about-hero-highlight">Purpose,</span>
                <br />
                Driven by <span className="about-hero-highlight">People</span>
              </h1>

              <div className="about-hero-text">
                <p>
                  Romega Solutions was founded on a simple insight{" "}
                  <strong>Growth shouldn&apos;t feel overwhelming or disconnected.</strong>{" "}
                  Too often, businesses struggle with hiring the right people,
                  clarifying their brand message, and aligning operations, all at
                  the same time. We saw an opportunity to bring those elements
                  together, not separately, but as an integrated approach to
                  intentional growth.
                </p>

                <p>
                  We started by helping Philippine-based talent connect with
                  global opportunity. Today, we&apos;ve grown into a trusted
                  partner for businesses worldwide, supporting teams, refining
                  brand presence, and powering sustainable growth.
                </p>
              </div>

              <Link href="/services" className="about-hero-cta">
                Connect with Us today!
              </Link>
            </div>
          </div>
        </section>

        <ConsultationBanner />
      </main>

      <SiteFooter />
    </div>
  );
}
