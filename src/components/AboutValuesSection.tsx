import Image from "next/image";

const values = [
  {
    title: (
      <>
        <span className="about-values-initial">R</span>eliable &amp;
        <br />
        <span className="about-values-initial">O</span>pportunity-Driven
      </>
    ),
    description:
      "We honor our commitments and create meaningful growth, delivering with integrity, consistency, and long-term vision.",
  },
  {
    title: (
      <>
        <span className="about-values-phrase">
          <span className="about-values-initial">M</span>eaningful Collaboration &amp;
        </span>
        <br />
        <span className="about-values-initial">E</span>xcellence
      </>
    ),
    description:
      "We work hand-in-hand with our partners, executing every project with clarity, quality, and purpose.",
  },
  {
    title: (
      <>
        <span className="about-values-initial">G</span>rowth-Focused &amp;
        <br />
        <span className="about-values-initial">A</span>daptable
      </>
    ),
    description:
      "We innovate boldly and stay agile, building teams and brands that thrive in a changing world.",
  },
];

export function AboutValuesSection() {
  return (
    <section className="about-values-section" aria-labelledby="about-values-title">
      <div className="about-values-inner">
        <div className="about-values-photo-frame">
          <Image
            src="/prompt-images/about/4_what_we_stand.png"
            alt="A team collaborating around a laptop"
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
            className="about-values-photo"
          />
        </div>

        <div className="about-values-copy">
          <h2 id="about-values-title" className="about-values-title">
            What We Stand For
          </h2>

          <div className="about-values-list">
            {values.map((value) => (
              <article key={value.description} className="about-values-item">
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
