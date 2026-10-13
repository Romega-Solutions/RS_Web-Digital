import { isRichTextEmpty, sanitizeRichText } from "@/lib/sanitize";
import styles from "./RichText.module.css";

type RichTextProps = {
  html: string;
  className?: string;
};

/**
 * Server component. Renders stored job-description HTML with the portal's
 * `.rs-richtext` typography. Sanitizes again at render time.
 */
export function RichText({ html, className }: RichTextProps) {
  const clean = sanitizeRichText(html);
  if (isRichTextEmpty(clean)) return null;

  const classNameValue = className ? `${styles.root} rs-richtext ${className}` : `${styles.root} rs-richtext`;

  return <div className={classNameValue} dangerouslySetInnerHTML={{ __html: clean }} />;
}
