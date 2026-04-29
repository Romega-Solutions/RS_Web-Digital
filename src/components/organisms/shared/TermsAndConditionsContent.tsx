import { LegalRichText } from "@/components/molecules/legal/LegalRichText";

export function TermsAndConditionsContent() {
  return (
    <LegalRichText>
      <p className="text-xl font-medium text-[var(--color-text-main)]">
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) are a legally binding
        agreement between you (&ldquo;you&rdquo; or &ldquo;user&rdquo;), whether
        personally or on behalf of an organization, and Romega Solutions
        (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
        &ldquo;us&rdquo;), governing your access to and use of our website and services.
      </p>

      <h2 id="section-1">1. AGREEMENT TO TERMS</h2>
      <p className="text-[var(--color-text-main)]">
        By accessing or using our Site, submitting your information, or engaging
        our services, you agree to be bound by these Terms. If you do not agree,
        you must immediately stop using the Site.
      </p>
      <p className="text-[var(--color-text-main)]">
        We may update these Terms at any time, and the updated version will be
        indicated by a &ldquo;Last Updated&rdquo; date. Your continued use of
        the Site after changes are posted constitutes acceptance of those
        changes.
      </p>

      <h2 id="section-2">2. USE OF THE SITE</h2>
      <ul>
        <li className="text-[var(--color-text-main)]">You must be at least 18 years old to use this Site.</li>
        <li className="text-[var(--color-text-main)]">
          You agree to use the Site only for lawful purposes and in compliance with
          all applicable laws.
        </li>
        <li className="text-[var(--color-text-main)]">
          You agree not to use the Site in a way that may damage, disable,
          overburden, or impair our systems or interfere with others&apos; use.
        </li>
      </ul>


      <h2 id="section-3">3. INFORMATION YOU PROVIDE</h2>
      <p>
        By submitting information (such as a resume, job application, or business
        inquiry) you represent and warrant that:
      </p>
      <ul>
        <li>The information is accurate, current, and complete.</li>
        <li>You have the right to share such information with us.</li>
        <li>
          You understand your information will be handled according to our Privacy
          Policy.
        </li>
      </ul>
      <p>
        We are not responsible for verifying the accuracy of any information
        submitted by users.
      </p>

      <h2 id="section-4">4. CLIENT SERVICES</h2>
      <p>
        Clients engaging Romega Solutions for staffing, recruiting, or consulting
        services may be required to enter into separate agreements outlining scope,
        fees, and terms. Those agreements shall take precedence over these Terms in
        the event of conflict.
      </p>

      <h2 id="section-5">5. INTELLECTUAL PROPERTY</h2>
      <p>
        All content on the Site, including text, graphics, logos, and software, is
        the property of Romega Solutions or its licensors and is protected by
        copyright and trademark laws. You may not copy, reproduce, or distribute
        any content without prior written permission.
      </p>

      <h2 id="section-6">6. THIRD-PARTY LINKS & SERVICES</h2>
      <p>
        The Site may contain links to third-party websites. We are not responsible
        for the content, policies, or practices of any third parties. Accessing
        these sites is at your own risk.
      </p>

      <h2 id="section-7">7. DISCLAIMERS</h2>
      <ul>
        <li>
          The Site is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We
          make no warranties, express or implied, about the accuracy, reliability,
          or availability of the Site or its content.
        </li>
        <li>
          Romega Solutions does not guarantee job placement for candidates or
          specific results for clients.
        </li>
        <li>
          We are not liable for any damages resulting from your use of the Site or
          services, including lost profits, data, or business opportunities.
        </li>
      </ul>

      <h2 id="section-8">8. INDEMNIFICATION</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Romega Solutions, its
        affiliates, employees, and partners from any claims, damages, or expenses
        arising out of your use of the Site, your submissions, or your violation of
        these Terms.
      </p>

      <h2 id="section-9">9. GOVERNING LAW & DISPUTE RESOLUTION</h2>
      <p>
        These Terms are governed by the laws of the State of California, without
        regard to conflict of laws principles.
      </p>
      <p>
        Disputes shall first be attempted to be resolved informally. If unresolved,
        disputes will be subject to binding arbitration in Los Angeles County,
        California, except where prohibited by law.
      </p>

      <h2 id="section-10">10. TERMINATION</h2>
      <p>
        We reserve the right to suspend or terminate your access to the Site at any
        time, without notice, for conduct that violates these Terms or is otherwise
        harmful to our business interests.
      </p>

      <h2 id="section-11">11. CONTACT US</h2>
      <p>
        For questions or concerns regarding these Terms, please contact us:
      </p>
      <div className="my-8 rounded-2xl bg-page p-8 border border-gray-100 shadow-inner">
        <p className="mb-2 font-bold text-brand-secondary">Romega Solutions Legal</p>
        <p className="mb-2">Email: info@romega-solutions.com</p>
        <p className="mb-2">Website: www.romega-solutions.com</p>
        <p className="mb-0">222 Pacific Coast Hwy, #10, El Segundo, CA 90245</p>
      </div>
      </LegalRichText>
      );
      }
