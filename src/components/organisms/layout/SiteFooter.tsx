"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import styles from "./SiteFooter.module.css";

const officeAddressQuery = "222 Pacific Coast Hwy #10 El Segundo CA 90245";
const googleMapsEmbedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
const googleMapsEmbedSrc = googleMapsEmbedKey
  ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsEmbedKey}&q=${encodeURIComponent(officeAddressQuery)}`
  : `https://www.google.com/maps?q=${encodeURIComponent(officeAddressQuery)}&output=embed`;

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
      className={styles.socialIcon}
    >
      <path
        d="M6.94 6.5A1.94 1.94 0 1 1 3.06 6.5a1.94 1.94 0 0 1 3.88 0Zm.06 3H3v12h4V9.5Zm6.5 0H9.5v12h4v-6.68c0-1.76.33-3.46 2.51-3.46 2.15 0 2.18 2.01 2.18 3.57V21.5h4v-7.42c0-3.64-.78-6.43-5.04-6.43-2.05 0-3.42 1.12-3.95 2.18h-.06V9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
      className={styles.socialIcon}
    >
      <path
        d="M14 8.5V7.1c0-.66.44-1.1 1.1-1.1H16V2h-1.9C11.4 2 10 3.4 10 5.7V8.5H7v3.5h3V22h4v-10h3l.5-3.5H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
      className={styles.socialIcon}
    >
      <path
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.25A4.25 4.25 0 1 1 7.75 11.5 4.25 4.25 0 0 1 12 7.25Zm0 2A2.25 2.25 0 1 0 14.25 11.5 2.25 2.25 0 0 0 12 9.25Zm5.5-2.55a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <Image
              src="/RS_HORIZONTAL_CROPPED.png"
              alt="Romega Solutions"
              width={3259}
              height={1362}
              sizes="(max-width: 767px) 12rem, (max-width: 1023px) 13rem, 13.5rem"
              loading="eager"
              className={styles.logoImage}
            />
          </div>
          <p className={styles.tagline}>
            We help businesses grow through talent support, brand direction, and
            practical guidance built for steady, long-term progress.
          </p>
        </div>

        <div className={styles.mainRight}>
          <nav className={styles.links} aria-label="Footer navigation">
            <div className={styles.navGroups}>
              <div className={styles.navGroup}>
                <h4 className={styles.navGroupTitle}>Company</h4>
                <ul className={styles.navList}>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <Link href="/careers">Careers</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.navGroup}>
                <h4 className={styles.navGroupTitle}>Solutions</h4>
                <ul className={styles.navList}>
                  <li>
                    <Link href="/services">Services</Link>
                  </li>
                  <li>
                    <Link href="/talent">Talent</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className={styles.connect}>
            <h3>Connect With Us</h3>

            <div className={styles.socials}>
              <a
                href={siteConfig.linkedIn}
                className={styles.socialLink}
                data-tooltip="LinkedIn"
                aria-label="Romega Solutions on LinkedIn"
                title="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
                <span className={styles.socialLabel}>LinkedIn</span>
              </a>
              <a
                href={siteConfig.facebook}
                className={styles.socialLink}
                data-tooltip="Facebook"
                aria-label="Romega Solutions on Facebook"
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
                <span className={styles.socialLabel}>Facebook</span>
              </a>
              <a
                href={siteConfig.instagram}
                className={styles.socialLink}
                data-tooltip="Instagram"
                aria-label="Romega Solutions on Instagram"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
                <span className={styles.socialLabel}>Instagram</span>
              </a>
            </div>

            <a
              href="mailto:info@romega-solutions.com"
              className={styles.contactBlock}
              aria-label="Email info@romega-solutions.com"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={styles.contactIcon}
                focusable="false"
              >
                <path
                  d="M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m3.5 8 7.4 5.8a1.8 1.8 0 0 0 2.2 0L20.5 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.contactCopy}>
                <span className={styles.contactLabel}>Email</span>
                <span className={styles.contactText}>
                  info@romega-solutions.com
                </span>
              </div>
            </a>
            <address className={styles.contactBlock}>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={styles.contactIcon}
                focusable="false"
              >
                <path
                  d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <div className={styles.contactCopy}>
                <span className={styles.contactLabel}>Office</span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=222+Pacific+Coast+Hwy+%2310+El+Segundo+CA+90245"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>222 Pacific Coast Hwy, #10</span>
                  <span>El Segundo, CA 90245</span>
                </a>
              </div>
            </address>
          </div>

          <div className={styles.mapCard}>
            <iframe
              title="Romega Solutions office location in Google Maps"
              src={googleMapsEmbedSrc}
              className={styles.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <a href="#top" className={styles.backtop}>
          <span className={styles.backtopArrow}>↑</span>
          <span>back to top</span>
        </a>
      </div>

      <div className={styles.legal}>
        <p>
          © 2026 Romega Solutions. All rights reserved.
          <span className={styles.legalSeparator}>|</span>
          <Link href="/privacy">Privacy Policy</Link>
          <span className={styles.legalSeparator}>|</span>
          <Link href="/terms">Terms and Conditions</Link>
        </p>
      </div>
    </footer>
  );
}
