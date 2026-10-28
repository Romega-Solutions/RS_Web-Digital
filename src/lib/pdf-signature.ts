// A real PDF starts with the five bytes "%PDF-". The browser's file picker and
// the file name only say what the visitor's device guessed; this looks at the
// file itself. It is a cheap sanity check, not a malware scan: it keeps a
// renamed image, script or archive from being passed on as a resume.

export const PDF_SIGNATURE = "%PDF-";
export const PDF_SIGNATURE_BYTES = PDF_SIGNATURE.length;

export function hasPdfSignature(head: Uint8Array): boolean {
  if (head.length < PDF_SIGNATURE_BYTES) return false;
  for (let i = 0; i < PDF_SIGNATURE_BYTES; i++) {
    if (head[i] !== PDF_SIGNATURE.charCodeAt(i)) return false;
  }
  return true;
}

type Sliceable = { slice(start: number, end: number): { arrayBuffer(): Promise<ArrayBuffer> } };

/** Reads only the first bytes of the upload, never the whole file. */
export async function isPdfFile(file: Sliceable): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, PDF_SIGNATURE_BYTES).arrayBuffer());
  return hasPdfSignature(head);
}
