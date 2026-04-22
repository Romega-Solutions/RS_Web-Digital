type ServiceStripProps = {
  items?: string[];
};

const defaultItems = [
  "Our Services",
  "Talent Acquisition",
  "Digital Marketing",
  "Website Development",
];

export function ServiceStrip({ items = defaultItems }: ServiceStripProps) {
  const marqueeItems = [...items, ...items];

  return (
    <section className="service-strip">
      <div className="service-strip__track">
        {marqueeItems.map((item, index) => (
          <span key={`${item}-${index}`} className="service-strip__item">
            {item}
            <span className="service-strip__separator" aria-hidden="true">
              *
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
