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
      <div className="service-strip-track">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`} className="service-strip-item">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
