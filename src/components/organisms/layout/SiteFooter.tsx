"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <Image
              src="/RS_HORIZONTAL.png"
              alt="Romega Solutions"
              width={3732}
              height={2546}
              sizes="(max-width: 767px) 11.5rem, (max-width: 1023px) 12.5rem, 13.5rem"
              className={styles.logoImage}
            />
          </div>
          <p className={styles.tagline}>
            We provide talent solutions, brand support, and strategic guidance
            designed for sustainable growth in a global landscape.
          </p>
        </div>

        <div className={styles.mainRight}>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/talent">Talents</Link>
          </nav>

          <div className={styles.connect}>
            <h3>Connect With Us</h3>
            <div className={styles.socials}>
              <a
                href={siteConfig.linkedIn}
                className={styles.socialLink}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/2.0%20Website%20Assets/Icon%2006%20_%20Global%20Perspective.webp"
                  alt=""
                  width={44}
                  height={44}
                  sizes="(max-width: 767px) 40px, 44px"
                  className={styles.socialIcon}
                />
              </a>
              <a
                href={siteConfig.facebook}
                className={styles.socialLink}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/2.0%20Website%20Assets/Icon%2002%20_%20Stronger%20Brand%20Foundations.webp"
                  alt=""
                  width={44}
                  height={44}
                  sizes="(max-width: 767px) 40px, 44px"
                  className={styles.socialIcon}
                />
              </a>
              <a
                href={siteConfig.instagram}
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/2.0%20Website%20Assets/Icon%2005%20_%20Long-Term%20Confidence.webp"
                  alt=""
                  width={44}
                  height={44}
                  sizes="(max-width: 767px) 40px, 44px"
                  className={styles.socialIcon}
                />
              </a>
            </div>

            <p className={styles.contact}>
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
              <a href="mailto:info@romega-solutions.com">info@romega-solutions.com</a>
            </p>
            <p className={styles.contact}>
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
                <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>222 Pacific Coast Hwy, #10, El Segundo, CA 90245</span>
            </p>
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
