import Image from "next/image";
import styles from "./AboutValuesSection.module.css";

const values = [
  {
    title: (
      <>
        <span className={styles.initial}>R</span>eliable &amp;
        <br />
        <span className={styles.initial}>O</span>pportunity-Driven
      </>
    ),
    description:
      "We honor our commitments and create meaningful growth, delivering with integrity, consistency, and long-term vision.",
  },
  {
    title: (
      <>
        <span className={styles.phrase}>
          <span className={styles.initial}>M</span>eaningful Collaboration &amp;
        </span>
        <br />
        <span className={styles.initial}>E</span>xcellence
      </>
    ),
    description:
      "We work hand-in-hand with our partners, executing every project with clarity, quality, and purpose.",
  },
  {
    title: (
      <>
        <span className={styles.initial}>G</span>rowth-Focused &amp;
        <br />
        <span className={styles.initial}>A</span>daptable
      </>
    ),
    description:
      "We innovate boldly and stay agile, building teams and brands that thrive in a changing world.",
  },
];

export function AboutValuesSection() {
  return (
    <section className={styles.root} aria-labelledby="about-values-title">
      <div className={styles.inner}>
        <div className={styles.photoFrame}>
          <Image
            src="/stand-1.webp"
            alt="A team collaborating around a laptop"
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
            className={styles.photo}
          />
        </div>

        <div className={styles.copy}>
          <h2 id="about-values-title" className={styles.title}>
            What We Stand For
          </h2>

          <div className={styles.list}>
            {values.map((value) => (
              <article key={value.description} className={styles.item}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
