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
        This Applicant Data Privacy and Consent Policy explains how Romega
        Solutions collects, processes, stores, retains, and shares applicant and
        professional information for recruitment, engagement, and talent matching
        purposes.
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
        applicants, candidates, and contacts through website forms, recruitment
        workflows, and related channels.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Full name and contact details</li>
        <li>Resume or CV and work history</li>
        <li>Portfolio links, project samples, and certifications</li>
        <li>Interview, assessment, and evaluation records</li>
        <li>
          Professional profile links (for example LinkedIn or portfolio pages)
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        B. Purpose of Processing
      </h4>
      <p className="text-gray-700 mb-3">
        We process information only for legitimate professional purposes.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Recruitment and qualification assessment</li>
        <li>Communication about applications and opportunities</li>
        <li>Future talent pool consideration (when consented)</li>
        <li>
          Client and project matching based on relevant professional
          qualifications (when consented)
        </li>
        <li>
          Public talent showcase publication only with separate explicit
          publication consent
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        C. Retention of Applicant Data
      </h4>
      <p className="text-gray-700 mb-3">
        We retain data only for a reasonable period necessary for recruitment,
        matching, legal, and operational requirements.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Retention supports future role matching and business continuity</li>
        <li>Data is reviewed and minimized periodically</li>
        <li>
          Applicants may request deletion or removal, subject to legal limitations
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        D. Sharing and Disclosure of Information
      </h4>
      <p className="text-gray-700 mb-3">
        We disclose only what is necessary and relevant for evaluation and
        matching.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Authorized internal personnel involved in recruitment and staffing</li>
        <li>
          Potential clients or partners for role/project matching with applicant
          consent
        </li>
        <li>Lawful disclosures required by legal or regulatory obligations</li>
      </ul>
      <p className="text-gray-700 mb-6">
        Sensitive information not required for evaluation is not shared without
        additional consent.
      </p>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        E. Data Protection and Security
      </h4>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Administrative, technical, and organizational safeguards are implemented</li>
        <li>
          Access is limited to authorized personnel with confidentiality
          responsibilities
        </li>
        <li>Security controls are continuously monitored and improved</li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        F. Data Subject Rights
      </h4>
      <p className="text-gray-700 mb-3">
        In line with applicable data privacy regulations, you may request to:
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Be informed about data processing activities</li>
        <li>Access your personal information</li>
        <li>Correct inaccurate or incomplete records</li>
        <li>Withdraw consent for optional processing scopes</li>
        <li>
          Request deletion, blocking, or removal subject to legal and operational
          limits
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
        G. Voluntary Consent and Public Showcase Rule
      </h4>
      <p className="text-gray-700 mb-3">
        Consent must be informed, specific, and voluntary.
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Required consent is used for core recruitment processing</li>
        <li>Optional consent scopes are captured separately</li>
        <li>Public profile publishing is always separate explicit opt-in</li>
        <li>No publication consent means profile is not publicly listed</li>
      </ul>

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
