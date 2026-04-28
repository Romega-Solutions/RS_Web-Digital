import React from "react";

interface HomeTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  hero: React.ReactNode;
  serviceStrip: React.ReactNode;
  growth: React.ReactNode;
  trust: React.ReactNode;
  approach: React.ReactNode;
  spotlight: React.ReactNode;
  testimonials: React.ReactNode;
  social: React.ReactNode;
  footer: React.ReactNode;
}

export function HomeTemplate({
  jsonLd,
  header,
  hero,
  serviceStrip,
  growth,
  trust,
  approach,
  spotlight,
  testimonials,
  social,
  footer,
}: HomeTemplateProps) {
  return (
    <div className="site-shell site-shell--home" id="top">
      {jsonLd}
      {header}

      <main id="main-content" tabIndex={-1}>
        {hero}
        {serviceStrip}
        {growth}
        {trust}
        {approach}
        {spotlight}
        {testimonials}
        {social}
        {footer}
      </main>
    </div>
  );
}
