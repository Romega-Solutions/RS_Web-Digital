import { isValidClarityId } from "@/lib/analytics/clarity";
import ClarityConsentBanner from "./ClarityConsentBanner";

// Microsoft Clarity with its consent banner. The layout renders this only on
// Production with a valid project ID; the check here is a second guard. The
// tag itself is loaded by the banner, and only after the visitor accepts.
export default function Clarity({ projectId }: { projectId: string }) {
  if (!isValidClarityId(projectId)) return null;
  return <ClarityConsentBanner projectId={projectId} />;
}
