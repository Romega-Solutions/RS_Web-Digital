// Values the browser and the server must agree on. Nothing here is secret.

export type TurnstileForm = "contact" | "apply";

// The header the form sends its one-time token in.
export const TURNSTILE_TOKEN_HEADER = "x-turnstile-token";

// The widget action each form asks for. Siteverify echoes it back, so a token
// minted for one form cannot be replayed against the other.
export const TURNSTILE_ACTIONS: Record<TurnstileForm, string> = {
  contact: "contact",
  apply: "apply",
};
