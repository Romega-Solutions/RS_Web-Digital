import React from "react";

interface LegalTemplateProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function LegalTemplate({
  header,
  footer,
  title,
  children,
}: LegalTemplateProps) {
  return (
    <div className="site-shell" id="top">
      {header}

      <main id="main-content" tabIndex={-1} className="legal-page-shell">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>

      {footer}
    </div>
  );
}
