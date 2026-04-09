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

        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <a href="#">Careers</a>
          <a href="#">Talents</a>
        </nav>

        <div className="site-footer-connect">
          <h3>Connect With Us</h3>
          <div className="site-footer-socials">
            <a href="#" className="site-footer-social-link" aria-label="LinkedIn">
              <img
                src="/2.0%20Website%20Assets/20.png"
                alt=""
                className="site-footer-social-icon"
              />
            </a>
            <a href="#" className="site-footer-social-link" aria-label="Facebook">
              <img
                src="/2.0%20Website%20Assets/18.png"
                alt=""
                className="site-footer-social-icon"
              />
            </a>
            <a href="#" className="site-footer-social-link" aria-label="Instagram">
              <img
                src="/2.0%20Website%20Assets/19.png"
                alt=""
                className="site-footer-social-icon"
              />
            </a>
          </div>

          <p className="site-footer-contact">
            <span aria-hidden="true">✉</span>
            <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
          </p>
          <p className="site-footer-contact">
            <span aria-hidden="true">⌖</span>
            <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
          </p>
        </div>

        <a href="#top" className="site-footer-backtop">
          <span className="site-footer-backtop-arrow">↑</span>
          <span>back to top</span>
        </a>
      </div>

      <div className="site-footer-legal">
        <p>
          © 2026 Romega Solutions. All rights reserved.
          <span className="site-footer-legal-separator">|</span>
          <a href="#">Privacy Policy</a>
          <span className="site-footer-legal-separator">|</span>
          <a href="#">Terms of Use</a>
        </p>
      </div>
    </footer>
  );
}
