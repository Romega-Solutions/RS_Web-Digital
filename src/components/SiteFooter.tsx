import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-logo-wrap">
            <span className="site-footer-logo-mark">RS</span>
            <div className="site-footer-logo-text">
              <strong>ROMEGA SOLUTIONS</strong>
              <span>HR AND MARKETING SERVICES</span>
            </div>
          </div>
          <p className="site-footer-tagline">
            We provide talent solutions, brand support, and strategic guidance
            designed for sustainable growth in a global landscape.
          </p>
        </div>

        <div className="site-footer-links">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <a href="#">Careers</a>
          <a href="#">Talents</a>
        </div>

        <div className="site-footer-connect">
          <h3>Connect With Us</h3>
          <div className="site-footer-socials" aria-hidden="true">
            <span className="site-footer-social">in</span>
            <span className="site-footer-social">f</span>
            <span className="site-footer-social">ig</span>
          </div>

          <p className="site-footer-contact">
            <span>@</span>
            <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
          </p>
          <p className="site-footer-contact">
            <span>o</span>
            <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
          </p>
        </div>

        <a href="#top" className="site-footer-backtop">
          <span className="site-footer-backtop-arrow">^</span>
          <span>back to top</span>
        </a>
      </div>

      <div className="site-footer-legal">
        <p>
          © 2026 Romega Solutions. All rights reserved.
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </p>
      </div>
    </footer>
  );
}
