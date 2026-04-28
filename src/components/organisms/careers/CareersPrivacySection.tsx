import Image from "next/image";
import { AppButton } from "@/components/atoms/Button";
import styles from "./CareersPrivacySection.module.css";

interface PrivacyFeature {
  title: string;
  icon: string;
}

interface CareersPrivacySectionProps {
  privacyFeatures: readonly PrivacyFeature[];
  onOpenJobs: () => void;
}

export function CareersPrivacySection({ privacyFeatures, onOpenJobs }: CareersPrivacySectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Privacy and Discretion</h2>
        <p className={styles.copy}>
          We understand that many high-level candidates are currently
          employed. Romega Solutions handles every career conversation with
          the highest level of confidentiality and respect for your current
          standing.
        </p>

        <div className={styles.grid}>
          {privacyFeatures.map((feature) => (
            <article key={feature.title} className={styles.card}>
              <Image
                src={feature.icon}
                alt=""
                width={48}
                height={48}
                className={styles.icon}
              />
              <h3>{feature.title}</h3>
            </article>
          ))}
        </div>

        <div className={styles.bottom}>
          <AppButton 
            onClick={onOpenJobs} 
            variant="primary" 
            size="lg"
          >
            Explore Current Opportunities
          </AppButton>
        </div>
      </div>
    </section>
  );
}
