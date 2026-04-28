import Image from "next/image";

export function AboutPartnersSection() {
  return (
    <section className="about-partners-section" aria-labelledby="about-partners-title">
      <div className="about-partners-inner">
        <h2 id="about-partners-title" className="about-partners-title">
          Who We Partner With
        </h2>

        <div className="about-partners-copy">
          <p>
            We work with founders, executives, and growing teams from startups to
            established organizations, all who share one thing in common: a
            commitment to build growth that&apos;s intentional, confident, and strategic.
          </p>
          <p>
            Whether you&apos;re expanding into new markets, building internal
            capabilities, or strengthening your brand identity,{" "}
            <strong>Romega stands with you as a growth partner.</strong>
          </p>
        </div>

        <div className="about-partners-map" aria-label="Romega partner regions">
          <Image
            src="/map.png"
            alt="World map showing Romega partner regions"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className="about-partners-world"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
