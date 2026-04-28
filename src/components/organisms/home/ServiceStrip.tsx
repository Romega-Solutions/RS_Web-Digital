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
  return (
    <section className="service-strip">
      <div className="service-strip__track">
        {items.map((item, index) => (
          <span key={item} className="service-strip__item">
            {item}
            {index < items.length - 1 ? (
              <span className="service-strip__separator" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}
