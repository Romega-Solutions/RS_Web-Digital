import type { ReactNode } from "react";

type FilterSectionProps = {
  title: string;
  className?: string;
  headingClassName?: string;
  children: ReactNode;
};

export function FilterSection({
  title,
  className = "",
  headingClassName = "",
  children,
}: FilterSectionProps) {
  return (
    <section className={className}>
      <h2 className={headingClassName}>{title}</h2>
      {children}
    </section>
  );
}
