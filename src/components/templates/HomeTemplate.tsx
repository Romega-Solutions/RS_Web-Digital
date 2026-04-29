import React from "react";
import { MainTemplate } from "./MainTemplate";

interface HomeTemplateProps {
  jsonLd?: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function HomeTemplate({
  jsonLd,
  header,
  children,
  footer,
}: HomeTemplateProps) {
  return (
    <MainTemplate
      jsonLd={jsonLd}
      header={header}
      footer={footer}
      shellVariant="home"
    >
      {children}
    </MainTemplate>
  );
}
