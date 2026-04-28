"use client";

import { useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "Romega placed three VP-level executives in record time, helping us avoid months of lost revenue.",
    author: "Martin Reyes, CEO",
  },
  {
    quote: "The team gave us structure in hiring and operations without slowing growth momentum.",
    author: "Alicia Navarro, COO",
  },
  {
    quote: "They translated our strategy into practical talent and brand decisions we could execute quickly.",
    author: "Derrick Hall, Founder",
  },
  {
    quote: "Clear communication, strong candidate quality, and a process our leadership could trust.",
    author: "Nina Lopez, Head of People",
  },
  {
    quote: "Romega felt like an extension of our team from week one, not an external vendor.",
    author: "Kevin Brooks, Managing Director",
  },
];

export function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previous = () => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section
      className="testimonial-section"
      aria-labelledby="testimonial-heading"
    >
      <h2 id="testimonial-heading" className="sr-only">
        Client testimonials
      </h2>
      <div className="testimonial-backdrop" aria-hidden="true" />
      <div className="testimonial-overlay" aria-hidden="true" />

      <button
        type="button"
        className="testimonial-arrow testimonial-arrow-left"
        aria-label="Previous testimonial"
        onClick={previous}
      >
        &lt;
      </button>
      <button
        type="button"
        className="testimonial-arrow testimonial-arrow-right"
        aria-label="Next testimonial"
        onClick={next}
      >
        &gt;
      </button>

      <div className="testimonial-content">
        <blockquote className="testimonial-quote" aria-live="polite">
          &ldquo;{activeTestimonial.quote}&rdquo;
        </blockquote>
        <p className="testimonial-author">{activeTestimonial.author}</p>

        <div className="testimonial-dots" aria-label="Select testimonial">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.author}
              type="button"
              className={`testimonial-dot ${
                index === activeIndex ? "testimonial-dot-active" : ""
              }`}
              aria-label={`Show testimonial ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
