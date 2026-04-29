import React from "react";
import styles from "./LegalTemplate.module.css";
import { MainTemplate } from "./MainTemplate";

interface LegalTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function LegalTemplate({
  jsonLd,
  header,
  footer,
  title,
  children,
}: LegalTemplateProps) {
  return (
    <MainTemplate
      jsonLd={jsonLd}
      header={header}
      footer={footer}
      mainClassName={styles.main}
    >
        <h1 className="sr-only">{title}</h1>
        {children}
    </MainTemplate>
  );
}
