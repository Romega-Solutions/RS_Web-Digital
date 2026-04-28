import Image from "next/image";
import { ExploreServicesButton } from "@/components/atoms/Button";

type HomeHeroProps = {
  buttonHref?: string;
};

export function HomeHero({ buttonHref = "/services" }: HomeHeroProps) {
  return (
    <section className="home-hero">
      <Image
        src="/2.0%20Website%20Assets/Hero%20Background.webp"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
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
          <span className="home-hero__copy-line">
            Partnering with businesses to grow teams,
          </span>
          <span className="home-hero__copy-line">
            strengthen brands, and scale with confidence.
          </span>
        </p>

        <ExploreServicesButton variant="primary" size="lg" href={buttonHref} />
      </div>
    </section>
  );
}
