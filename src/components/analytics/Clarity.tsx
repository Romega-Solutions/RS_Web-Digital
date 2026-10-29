import Script from "next/script";
import { claritySnippet, isValidClarityId } from "@/lib/analytics/clarity";
import ClarityConsentBanner from "./ClarityConsentBanner";

// Loads Microsoft Clarity and shows its consent banner. The layout renders this
// only on Production with a valid project ID; the check here is a second guard.
export default function Clarity({ projectId }: { projectId: string }) {
  if (!isValidClarityId(projectId)) return null;
  return (
    <>
      <Script id="ms-clarity" strategy="afterInteractive">
        {claritySnippet(projectId)}
      </Script>
      <ClarityConsentBanner />
    </>
  );
}
