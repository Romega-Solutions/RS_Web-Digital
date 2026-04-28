import Link from "next/link";
import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
  PRIVACY_REQUEST_SLA_BUSINESS_DAYS,
} from "@/lib/legal/privacy-policy";

interface PrivacyPolicyContentProps {
  showCanonicalLink?: boolean;
}

export function PrivacyPolicyContent({
  showCanonicalLink = false,
}: PrivacyPolicyContentProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-lg text-gray-800 font-medium mb-6">
        This Privacy and Consent Policy explains how Romega Solutions collects,
        processes, stores, retains, and shares personal information from website
        visitors, applicants, and professional contacts.
      </p>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6 text-sm text-blue-900">
        <p className="m-0">
          <strong>Policy Version:</strong> {PRIVACY_POLICY_VERSION}
        </p>
        <p className="m-0">
          <strong>Last Updated:</strong> {PRIVACY_POLICY_LAST_UPDATED}
        </p>
      </div>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        A. Collection of Personal Information
      </h4>
      <p className="text-gray-700 mb-3">
        We collect personal and professional information voluntarily provided by
        visitors and applicants through website forms, recruitment workflows, and
        related communication channels.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Full name and contact details (email, phone number)</li>
        <li>Company name and professional background</li>
        <li>Resume or CV and work history (for applicants)</li>
        <li>Portfolio links, project samples, and certifications</li>
        <li>Inquiry details and message content</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        B. Purpose of Processing
      </h4>
      <p className="text-gray-700 mb-3">
        We process information only for legitimate business and professional
        purposes.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Responding to inquiries and providing requested information</li>
        <li>Recruitment and qualification assessment</li>
        <li>Communication about applications and opportunities</li>
        <li>Future talent pool consideration (when consented)</li>
        <li>
          Client and project matching based on relevant professional
          qualifications (when consented)
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        C. Cookies and Tracking
      </h4>
      <p className="text-gray-700 mb-3">
        Our website uses minimal cookies to ensure technical functionality and
        improve user experience.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
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
      <p className="text-gray-700 mb-6">
        You can manage or disable cookies through your browser settings, though
        some features of the site may not function correctly as a result.
      </p>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        D. Retention of Data
      </h4>
      <p className="text-gray-700 mb-3">
        We retain data only for a reasonable period necessary for the purposes
        outlined above, or as required by legal and operational obligations.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Inquiry data is retained to facilitate ongoing communication</li>
        <li>Applicant data supports future role matching and continuity</li>
        <li>Data is reviewed and minimized periodically</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        E. Sharing and Disclosure of Information
      </h4>
      <p className="text-gray-700 mb-3">
        We disclose only what is necessary and relevant for service delivery and
        evaluation.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Authorized internal personnel involved in operations and recruitment</li>
        <li>
          Service providers who assist in our business operations (subject to
          confidentiality)
        </li>
        <li>Lawful disclosures required by legal or regulatory obligations</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        F. Data Subject Rights
      </h4>
      <p className="text-gray-700 mb-3">
        In line with GDPR and other applicable data privacy regulations, you may
        request to:
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Be informed about data processing activities</li>
        <li>Access your personal information</li>
        <li>Correct inaccurate or incomplete records</li>
        <li>Withdraw consent for processing at any time</li>
        <li>Request deletion, blocking, or removal of your data</li>
        <li>Object to processing or request data portability</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        G. Voluntary Consent and Transparency
      </h4>
      <p className="text-gray-700 mb-3">
        Consent must be informed, specific, and voluntary. By using our contact
        forms or submitting applications, you acknowledge and agree to the terms
        outlined in this policy.
      </p>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        Public Data Minimization Standards
      </h4>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Allowed public fields focus on professional qualifications only</li>
        <li>Direct personal contact details are excluded from public pages</li>
        <li>Sensitive identifiers and protected attributes are never published</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        Contact and Requests
      </h4>
      <p className="text-gray-700 mb-2">
        For access, correction, withdrawal, deletion, and takedown requests,
        contact:
      </p>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p className="text-gray-700 mb-2">Email: {PRIVACY_CONTACT_EMAIL}</p>
        <p className="text-gray-700 mb-2">Website: www.romega-solutions.com</p>
        <p className="text-gray-700 mb-0">
          Address: 222 Pacific Coast Hwy, #10, El Segundo, CA 90245
        </p>
      </div>

      <p className="text-gray-700 mb-0">
        Target internal response timeline for privacy and takedown requests:
        within {PRIVACY_REQUEST_SLA_BUSINESS_DAYS} business days.
      </p>

      {showCanonicalLink && (
        <div className="mt-6 rounded-lg bg-gray-100 p-3 border border-gray-200">
          <Link href="/privacy" className="text-blue-700 hover:underline font-medium">
            Open the full Privacy Policy page
          </Link>
        </div>
      )}
    </div>
  );
}
