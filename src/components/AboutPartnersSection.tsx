const regions = [
  { name: "America", className: "about-partners-marker-america" },
  { name: "Europe", className: "about-partners-marker-europe" },
  { name: "Asia", className: "about-partners-marker-asia" },
  { name: "Australia", className: "about-partners-marker-australia" },
];

export function AboutPartnersSection() {
  return (
    <section className="about-partners-section" aria-labelledby="about-partners-title">
      <div className="about-partners-inner">
        <h2 id="about-partners-title" className="about-partners-title">
          Who We Partner With
        </h2>

        <div className="about-partners-copy">
          <p>
            We work with founders, executives, and growing teams from startups to
            established organizations, all who share one thing in common: a
            commitment to build growth that&apos;s intentional, confident, and strategic.
          </p>
          <p>
            Whether you&apos;re expanding into new markets, building internal
            capabilities, or strengthening your brand identity,{" "}
            <strong>Romega stands with you as a growth partner.</strong>
          </p>
        </div>

        <div className="about-partners-map" aria-label="Romega partner regions">
          <svg
            className="about-partners-world"
            viewBox="0 0 1200 520"
            role="img"
            aria-label="Stylized white world map"
          >
            <g>
              <path d="M50 204 82 171l69-18 57 9 39 27 47 4 47 35-14 37-46 18-27 36-50 6-28 53-67 21-62-28 20-52-38-35 17-41z" />
              <path d="M182 119 247 84l96 6 61 32-22 34-88 8-73-9-49 13-56-18z" />
              <path d="M278 367 326 392l42 66-23 46-44-22-34-65z" />
              <path d="M466 162 507 126l53 7 39 28-22 33-67 7z" />
              <path d="M568 194 623 151l88 8 49 42 76-20 105 30 97-6 112 49-39 55-89 2-43 47-88 9-63 62-93-18-45-57-78-12-76 37-82-28-45-66 43-62-68-38z" />
              <path d="M571 305 631 325l43 62-35 76-62-7-38-64z" />
              <path d="M803 98 851 72l76 13 62 34-42 33-96-6-57-20z" />
              <path d="M917 386 984 397l61 49-45 42-86-11-41-41z" />
              <path d="M1005 356 1041 337l38 16-12 36-42 3z" />
            </g>
          </svg>

          {regions.map((region) => (
            <div key={region.name} className={`about-partners-marker ${region.className}`}>
              <span className="about-partners-pin" aria-hidden="true">
                <span />
              </span>
              <span className="about-partners-label">{region.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
