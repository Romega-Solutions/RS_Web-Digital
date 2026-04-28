import React from "react";

interface MainTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

export function MainTemplate({
  jsonLd,
  header,
  children,
  footer,
  className = "",
}: MainTemplateProps) {
  return (
    <div className={`site-shell ${className}`} id="top">
      {jsonLd}
      {header}

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {footer}
    </div>
  );
}
