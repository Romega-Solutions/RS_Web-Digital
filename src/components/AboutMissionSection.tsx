import Image from "next/image";

export function AboutMissionSection() {
  return (
    <section className="about-mission-section" aria-labelledby="about-mission-title">
      <div className="about-mission-inner">
        <div className="about-mission-grid" aria-hidden="true" />

        <div className="about-mission-heading">
          <h2 id="about-mission-title" className="about-mission-title">
            Why we <em>do</em>
            <br />
            What we <em>do</em>
          </h2>
        </div>

        <div className="about-mission-photo about-mission-photo-main">
          <Image
            src="/prompt-images/about/3_vision.png"
            alt="Team members reviewing work at a computer"
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            className="about-mission-image"
          />
        </div>

        <div className="about-mission-photo about-mission-photo-mid">
          <Image
            src="/2.0%20Website%20Assets/Image%201%20_%20Talent%20Solutions.png"
            alt="Talent consultation in progress"
            fill
            sizes="(max-width: 767px) 48vw, 14rem"
            className="about-mission-image"
          />
        </div>

        <div className="about-mission-photo about-mission-photo-low">
          <Image
            src="/2.0%20Website%20Assets/Image%203%20_%20Strategic%20Operations.png"
            alt="Strategic planning conversation"
            fill
            sizes="(max-width: 767px) 52vw, 15rem"
            className="about-mission-image"
          />
        </div>

        <div className="about-mission-copy">
          <p>
            We believe businesses grow best when people, purpose, and clarity
            are aligned. Too many companies plateau not because opportunity, but
            because systems, teams, or brand identity aren&apos;t working in
            harmony.
          </p>
          <p>
            <strong>
              Romega exists to help founders, leaders, and teams build growth
              that feels structured, confident, and purposeful, not chaotic or
              reactive.
            </strong>
          </p>
        </div>

        <div className="about-mission-statement">
          <p>
            Our <em>Mission</em> is to be a steady growth partner for businesses
            by building strong teams and credible brands that last.
          </p>
        </div>
      </div>
    </section>
  );
}
