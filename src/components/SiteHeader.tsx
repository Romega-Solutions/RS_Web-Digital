import Link from "next/link";

type SiteHeaderProps = {
  activeItem?: "Home" | "About" | "Services" | "Careers & Talents";
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers & Talents", href: "#" },
] as const;

export function SiteHeader({ activeItem }: SiteHeaderProps) {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link href="/" className="brand-mark" aria-label="Romega Solutions home">
          <span className="brand-mark-icon" aria-hidden="true">
            RS
          </span>
          <span className="brand-mark-text">Romega Solutions</span>
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`menu-link ${item.label === activeItem ? "menu-link-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-cta-wrap">
          <span className="nav-cta-arrow" aria-hidden="true">
            →
          </span>
          <Link href="/services" className="cta-chip">
            Work with us
          </Link>
        </div>
      </div>
    </header>
  );
}
