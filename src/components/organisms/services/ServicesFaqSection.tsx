import styles from "./ServicesFaqSection.module.css";

export type ServicesFaqItem = {
  question: string;
  answer: string;
};

interface ServicesFaqSectionProps {
  faqs: readonly ServicesFaqItem[];
}

export function ServicesFaqSection({ faqs }: ServicesFaqSectionProps) {
  return (
    <section id="faq" className={styles.root} aria-labelledby="faq-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Frequently Asked</p>
          <h2 id="faq-title" className={styles.title}>
            Questions we hear most
          </h2>
        </header>

        <ul className={styles.list}>
          {faqs.map((item, index) => (
            <li key={item.question} className={styles.item}>
              <details className={styles.details} {...(index === 0 ? { open: true } : {})}>
                <summary className={styles.summary}>
                  <span>{item.question}</span>
                  <span aria-hidden="true" className={styles.chevron}>
                    +
                  </span>
                </summary>
                <p className={styles.answer}>{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
