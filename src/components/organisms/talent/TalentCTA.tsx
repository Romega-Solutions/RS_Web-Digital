import Image from "next/image";
import Link from "next/link";

export function TalentCTA() {
  return (
    <section className="talent-cta" aria-labelledby="talent-cta-heading">
      <div className="talent-cta__card">
        <div className="talent-cta__left">
          <h2 id="talent-cta-heading" className="talent-cta__title">
            Request a Custom Talent Search
          </h2>
          <p className="talent-cta__copy">
            If you are hiring for a role that is harder to define, we can narrow the
            brief, source the right profile, and guide the next conversation.
          </p>
          <div className="talent-cta__actions">
            <Link href="/contact" className="talent-cta__action talent-cta__action--primary">
              Contact us
            </Link>
            <Link href="/services" className="talent-cta__action talent-cta__action--secondary">
              Explore services
            </Link>
          </div>
        </div>

        <div className="talent-cta__divider" aria-hidden="true" />

        <div className="talent-cta__right">
          <div className="talent-cta__avatar-wrap">
            <Image
              src="/prompt-images/romega-talent.png"
              alt="Romega talent specialist"
              fill
              sizes="96px"
              className="talent-cta__avatar"
            />
          </div>
          <p className="talent-cta__expert-label">YOUR EXPERT</p>
          <p className="talent-cta__expert-name">Romega Talent Team</p>
          <p className="talent-cta__expert-title">Talent Matching and Growth Support</p>
        </div>
      </div>
    </section>
  );
}
