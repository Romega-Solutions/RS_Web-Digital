// Escapes text for use inside HTML, in element content or in a quoted
// attribute. Used for everything a visitor typed that ends up in an email body.

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ENTITIES[char]);
}
