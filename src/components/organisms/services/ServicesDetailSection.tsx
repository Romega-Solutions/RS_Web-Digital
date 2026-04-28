import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./ServicesDetailSection.module.css";

interface ServiceDetail {
  id: string;
  title: string;
  intro: string;
  copy: string;
  offerTitle: string;
  bullets: string[] | readonly string[];
  imageSrc: string;
  imageAlt: string;
}

interface ServicesDetailSectionProps {
  services: ServiceDetail[] | readonly ServiceDetail[];
}

export function ServicesDetailSection({ services }: ServicesDetailSectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        {services.map((service, index) => (
          <div
            key={service.id}
            id={service.id}
            className={`${styles.row} ${index % 2 !== 0 ? styles.rowReverse : ""}`}
          >
            <div className={styles.media}>
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                sizes="(max-width: 767px) 100vw, 44vw"
                className={styles.image}
              />
            </div>

            <div className={styles.copy}>
              <h2 className={styles.intro}>{service.intro}</h2>
              <p className={styles.text}>{service.copy}</p>

              <h3 className={styles.offer}>{service.offerTitle}</h3>
              <ul className={styles.list}>
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className={styles.ctaWrap}>
          <AppButton 
            href="#services-overview" 
            variant="primary" 
            size="md"
          >
            Discover How We Work
          </AppButton>
        </div>
      </div>
    </section>
  );
}
