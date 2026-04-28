import { ExploreServicesButton } from "@/components/atoms/Button";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({ buttonHref = "/services" }: HomeHeroProps) {
  return (
    <section className="home-hero">
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="home-hero__content">
        <h1 className="home-hero__headline">
          <span className="home-hero__line home-hero__line--first">
            Built for <span className="growing-word">growing</span> businesses.
          </span>
        </h1>
        <p className="home-hero__line home-hero__subtitle">
          Designed for <span className="home-hero__accent">what&apos;s next.</span>
        </p>

        <p className="home-hero__copy">
          Partnering with businesses to grow teams, strengthen brands, and scale with
          confidence.
        </p>

        <ExploreServicesButton className="home-hero__action" href={buttonHref} />
      </div>
    </section>
  );
}
