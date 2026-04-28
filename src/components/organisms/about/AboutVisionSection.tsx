import Image from "next/image";
import Link from "next/link";

export function AboutVisionSection() {
  return (
    <section className="about-vision-section" aria-labelledby="about-vision-title">
      <div className="about-vision-inner">
        <div className="about-vision-copy">
          <h2 id="about-vision-title" className="about-vision-title">
            Our Vision
          </h2>
          <p className="about-vision-text">
            To shape a future where businesses grow with clarity, consistency,
            and purpose, scaling not just by moving fast, but by building teams
            that perform with intention and brands that connect with trust,
            relevance, and long-term value.
          </p>
          <Link href="/services" className="about-vision-cta">
            Connect with Us today!
          </Link>
        </div>

        <div className="about-vision-photo-frame">
          <Image
            src="/vision-1.png"
            alt="A professional working from a laptop"
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            className="about-vision-photo"
          />
        </div>
      </div>
    </section>
  );
}
