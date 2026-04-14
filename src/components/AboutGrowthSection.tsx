const testimonials = [
  {
    quote:
      "As a freshman, my first internship at Romega turned daunting expectations into a supportive, skill-building experience that grew my confidence and gratitude.",
    name: "Rob Belarmino",
    school: "University of the Philippines",
    role: "Former Intern",
  },
  {
    quote:
      "As an Account Executive Intern, I learned how to build client relationships and strengthen my communication skills.",
    name: "Gerard Palma",
    school: "University of the Philippines",
    role: "Former Account Executive Intern",
  },
  {
    quote:
      "My internship as an Account Executive helped me grow in client engagement, adaptability, and teamwork.",
    name: "Eiran Peñaflor",
    school: "University of the Philippines",
    role: "Former Intern",
  },
  {
    quote:
      "Romega was the first company that gave me a chance to experience the corporate world. I walked in with nothing but curiosity and determination.",
    name: "Katrina Ignacio",
    school: "Bulacan State University",
    role: "Former Account Executive Intern",
  },
];

export function AboutGrowthSection() {
  return (
    <section className="about-growth-section" aria-labelledby="about-growth-title">
      <div className="about-growth-heading">
        <h2 id="about-growth-title" className="about-growth-title">
          Where Growth Begins
        </h2>
        <p>
          At Romega, we believe growth isn&apos;t limited to clients, it extends to
          every individual we work with. Our interns are given the space to
          learn, contribute, and gain real-world experience that prepares them
          for the next stage of their careers.
        </p>
      </div>

      <div className="about-growth-inner">
        <button className="about-growth-arrow about-growth-arrow-prev" type="button" aria-label="Previous testimonial">
          ‹
        </button>

        <div className="about-growth-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="about-growth-card">
              <div className="about-growth-stars" aria-label="Five star rating">
                ★★★★★
              </div>
              <p className="about-growth-quote">{testimonial.quote}</p>
              <div className="about-growth-person">
                <div className="about-growth-avatar" aria-hidden="true" />
                <div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.school}</p>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <span className="about-growth-mark" aria-hidden="true">
                ”
              </span>
            </article>
          ))}
        </div>

        <button className="about-growth-arrow about-growth-arrow-next" type="button" aria-label="Next testimonial">
          ›
        </button>
      </div>
    </section>
  );
}
