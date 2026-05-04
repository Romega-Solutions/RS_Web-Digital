import { ScrollReveal } from "@/components/atoms/Motion";
import styles from "./ApproachSection.module.css";

export function ApproachSection() {
  const principles = [
    {
      label: "Understand",
      text: "Start with the business reality before shaping the plan.",
    },
    {
      label: "Align",
      text: "Connect people, brand, and operations around one direction.",
    },
    {
      label: "Support",
      text: "Keep every next step clear, measured, and human.",
    },
  ];

  const focusAreas = ["Business clarity", "Brand alignment", "People systems"];

  return (
    <section className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <ScrollReveal variant="slideRight" duration={0.8} className={styles.left}>
          <p className={styles.eyebrow}>Intentional growth</p>
          <h2 className={styles.title}>
            <span className={styles.titleLine}>We don&apos;t</span>
            <br />
            <span className={styles.titleLine}>rush growth.</span>
            <br />
            <span className={`${styles.titleLine} ${styles.emphasis}`}>We build it</span>
            <br />
            <span className={`${styles.titleLine} ${styles.circled}`}>right.</span>
          </h2>
          <div className={styles.focusAreas} aria-label="Growth focus areas">
            {focusAreas.map((area) => (
              <span className={styles.focusArea} key={area}>
                {area}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slideLeft" delay={0.2} duration={0.8} className={styles.right}>
          <div className={styles.panel}>
            <p className={styles.panelLabel}>Our approach is simple</p>
            <h3 className={styles.heading}>
              Build the foundation before adding speed.
            </h3>
            <p className={styles.copy}>
              Understand your business, align people and brand, and support
              every step with clarity and care. We believe growth works best
              when teams and brands are built side by side, with intention.
            </p>

            <div className={styles.principles} aria-label="Romega growth approach">
              {principles.map((principle, index) => (
                <div className={styles.principle} key={principle.label}>
                  <span className={styles.principleIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className={styles.principleLabel}>{principle.label}</p>
                    <p className={styles.principleText}>{principle.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
