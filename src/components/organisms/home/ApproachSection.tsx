import styles from "./ApproachSection.module.css";

export function ApproachSection() {
  return (
    <section className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.left}>
          <h2 className={styles.title}>
            We don&apos;t
            <br />
            rush growth.
            <br />
            <span className={styles.emphasis}>We build it</span>
            <br />
            <span className={styles.circled}>right.</span>
          </h2>
        </div>

        <div className={styles.right}>
          <h3 className={styles.heading}>Our approach is simple:</h3>
          <p className={styles.copy}>
            Understand your business, align people and brand, and support
            every step with clarity and care. We believe growth works best
            when teams and brands are built side by side, with intention.
          </p>
        </div>
      </div>
    </section>
  );
}
