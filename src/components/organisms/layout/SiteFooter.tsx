import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-logo-wrap">
            <Image
              src="/RS_HORIZONTAL.png"
              alt="Romega Solutions"
              width={3732}
              height={2546}
              sizes="(max-width: 767px) 11.5rem, (max-width: 1023px) 12.5rem, 13.5rem"
              className="site-footer-logo-image"
            />
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
          <Link href="/careers">Careers</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/talent">Talents</Link>
        </nav>

        <div className="site-footer-connect">
          <h3>Connect With Us</h3>
          <div className="site-footer-socials">
            <a href="#" className="site-footer-social-link" aria-label="LinkedIn">
              <Image
                src="/2.0%20Website%20Assets/20.png"
                alt=""
                width={44}
                height={44}
                sizes="(max-width: 767px) 40px, 44px"
                className="site-footer-social-icon"
              />
            </a>
            <a href="#" className="site-footer-social-link" aria-label="Facebook">
              <Image
                src="/2.0%20Website%20Assets/18.png"
                alt=""
                width={44}
                height={44}
                sizes="(max-width: 767px) 40px, 44px"
                className="site-footer-social-icon"
              />
            </a>
            <a href="#" className="site-footer-social-link" aria-label="Instagram">
              <Image
                src="/2.0%20Website%20Assets/19.png"
                alt=""
                width={44}
                height={44}
                sizes="(max-width: 767px) 40px, 44px"
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
            <span>222 Pacific Coast Hwy, #10, El Segundo, CA 90245</span>
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
