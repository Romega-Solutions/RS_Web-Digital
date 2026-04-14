import { ExploreServicesButton } from "./ExploreServicesButton";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({ buttonHref = "/services" }: HomeHeroProps) {
  return (
    <section className="hero">
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content">
        <h1 className="headline">
          <span className="hero-line hero-line-one">
            Built for <span className="growing-word">growing</span> businesses.
          </span>
        </h1>
        <p className="hero-line hero-subtitle">
          Designed for <span className="accent-slab">what&apos;s next.</span>
        </p>

        <p className="hero-copy">
          Partnering with businesses to grow teams, strengthen brands, and scale with
          confidence.
        </p>

        <ExploreServicesButton className="hero-action" href={buttonHref} />
      </div>
    </section>
  );
}
