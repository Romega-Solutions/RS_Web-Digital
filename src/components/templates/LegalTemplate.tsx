import React from "react";
import styles from "./LegalTemplate.module.css";
import { MainTemplate } from "./MainTemplate";
import { LegalHero } from "@/components/molecules/legal/LegalHero";
import { LegalTableOfContents } from "@/components/molecules/legal/LegalTableOfContents";
import { ScrollProgress } from "@/components/atoms/feedback/ScrollProgress";

interface LegalTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalTemplate({
  jsonLd,
  header,
  footer,
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalTemplateProps) {
  return (
    <MainTemplate
      jsonLd={jsonLd}
      header={header}
      footer={footer}
      shellVariant="home"
      mainClassName={styles.main}
    >
      <ScrollProgress />
      <LegalHero 
        title={title} 
        subtitle={subtitle} 
        lastUpdated={lastUpdated} 
      />
      <div className={styles.content}>
        <div className={styles.layoutInner}>
          <LegalTableOfContents />
          <div className={styles.mainBody}>
            {children}
          </div>
        </div>
      </div>
    </MainTemplate>
  );
}
