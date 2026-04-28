import Image from "next/image";
import Link from "next/link";

export function ConsultationBanner() {
  return (
    <section className="services-consultation">
      <div className="services-consultation-media" aria-hidden="true">
        <Image
          src="/2.0%20Website%20Assets/3.png"
          alt=""
          fill
          sizes="100vw"
          className="services-consultation-image"
        />
      </div>
      <div className="services-consultation-overlay" aria-hidden="true" />

      <div className="services-consultation-content">
        <h2 className="services-consultation-title">
          Ready to grow with{" "}
          <span className="services-consultation-emphasis">intention?</span>
        </h2>

        <p className="services-consultation-copy">
          Let&apos;s build your teams, strengthen your brand, and design systems
          that help you scale with confidence.
        </p>

        <Link href="#top" className="services-consultation-cta">
          Schedule a Consultation
        </Link>
      </div>
    </section>
  );
}
