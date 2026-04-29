import Link from "next/link";
import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
  PRIVACY_REQUEST_SLA_BUSINESS_DAYS,
} from "@/lib/legal/privacy-policy";
import { LegalRichText } from "@/components/molecules/legal/LegalRichText";

interface PrivacyPolicyContentProps {
  showCanonicalLink?: boolean;
}

export function PrivacyPolicyContent({
  showCanonicalLink = false,
}: PrivacyPolicyContentProps) {
  return (
    <LegalRichText>
      <p className="text-xl font-medium text-[var(--color-text-main)]">
        This Privacy and Consent Policy explains how Romega Solutions collects,
        processes, stores, retains, and shares personal information from website
        visitors, applicants, and professional contacts.
      </p>

      <h2>A. Collection of Personal Information</h2>
      <p className="text-[var(--color-text-main)]">
        We collect personal and professional information voluntarily provided by
        visitors and applicants through website forms, recruitment workflows, and
        related communication channels.
      </p>
      <ul>
        <li className="text-[var(--color-text-main)]">Full name and contact details (email, phone number)</li>
        <li className="text-[var(--color-text-main)]">Company name and professional background</li>
        <li className="text-[var(--color-text-main)]">Resume or CV and work history (for applicants)</li>
        <li className="text-[var(--color-text-main)]">Portfolio links, project samples, and certifications</li>
        <li className="text-[var(--color-text-main)]">Inquiry details and message content</li>
      </ul>


      <h2 id="section-b">B. Purpose of Processing</h2>
      <p>
        We process information only for legitimate business and professional
        purposes.
      </p>
      <ul>
        <li>Responding to inquiries and providing requested information</li>
        <li>Recruitment and qualification assessment</li>
        <li>Communication about applications and opportunities</li>
        <li>Future talent pool consideration (when consented)</li>
        <li>
          Client and project matching based on relevant professional
          qualifications (when consented)
        </li>
      </ul>

      <h2 id="section-c">C. Cookies and Tracking</h2>
      <p>
        Our website uses minimal cookies to ensure technical functionality and
        improve user experience.
      </p>
      <ul>
        <li>
          <strong>Essential Cookies:</strong> Required for basic website
          functionality and security.
        </li>
        <li>
          <strong>Functional Cookies:</strong> Used to remember preferences and
          enhance your visit.
        </li>
        <li>
          <strong>Analytics:</strong> We may use anonymized analytics to
          understand website traffic patterns without identifying individual
          visitors.
        </li>
      </ul>
      <p>
        You can manage or disable cookies through your browser settings, though
        some features of the site may not function correctly as a result.
      </p>

      <h2 id="section-d">D. Retention of Data</h2>
      <p>
        We retain data only for a reasonable period necessary for the purposes
        outlined above, or as required by legal and operational obligations.
      </p>
      <ul>
        <li>Inquiry data is retained to facilitate ongoing communication</li>
        <li>Applicant data supports future role matching and continuity</li>
        <li>Data is reviewed and minimized periodically</li>
      </ul>

      <h2 id="section-e">E. Sharing and Disclosure of Information</h2>
      <p>
        We disclose only what is necessary and relevant for service delivery and
        evaluation.
      </p>
      <ul>
        <li>Authorized internal personnel involved in operations and recruitment</li>
        <li>
          Service providers who assist in our business operations (subject to
          confidentiality)
        </li>
        <li>Lawful disclosures required by legal or regulatory obligations</li>
      </ul>

      <h2 id="section-f">F. Data Subject Rights</h2>
      <p>
        In line with GDPR and other applicable data privacy regulations, you may
        request to:
      </p>
      <ul>
        <li>Be informed about data processing activities</li>
        <li>Access your personal information</li>
        <li>Correct inaccurate or incomplete records</li>
        <li>Withdraw consent for processing at any time</li>
        <li>Request deletion, blocking, or removal of your data</li>
        <li>Object to processing or request data portability</li>
      </ul>

      <h2 id="section-g">G. Voluntary Consent and Transparency</h2>
      <p>
        Consent must be informed, specific, and voluntary. By using our contact
        forms or submitting applications, you acknowledge and agree to the terms
        outlined in this policy.
      </p>

      <h2 id="section-minimization">Public Data Minimization Standards</h2>
      <ul>
        <li>Allowed public fields focus on professional qualifications only</li>
        <li>Direct personal contact details are excluded from public pages</li>
        <li>Sensitive identifiers and protected attributes are never published</li>
      </ul>

      <h2 id="section-contact">Contact and Requests</h2>
      <p>
        For access, correction, withdrawal, deletion, and takedown requests,
        contact:
      </p>
      <div className="my-8 rounded-2xl bg-page p-8 border border-gray-100 shadow-inner">
        <p className="mb-2 font-bold text-brand-secondary">Romega Solutions Privacy Office</p>
        <p className="mb-2">Email: {PRIVACY_CONTACT_EMAIL}</p>
        <p className="mb-2">Website: www.romega-solutions.com</p>
        <p className="mb-0">
          Address: 222 Pacific Coast Hwy, #10, El Segundo, CA 90245
        </p>
      </div>

      <p className="text-sm italic text-gray-500">
        Target internal response timeline for privacy and takedown requests:
        within {PRIVACY_REQUEST_SLA_BUSINESS_DAYS} business days.
      </p>
      <p className="text-xs text-gray-400 mt-4">
        Policy Version: {PRIVACY_POLICY_VERSION}
      </p>

      {showCanonicalLink && (
        <div className="mt-6 rounded-lg bg-gray-100 p-3 border border-gray-200">
          <Link href="/privacy" className="text-blue-700 hover:underline font-medium">
            Open the full Privacy Policy page
          </Link>
        </div>
      )}
    </LegalRichText>
  );
}
