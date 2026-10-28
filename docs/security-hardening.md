# Security hardening notes

Operating notes for the security checks on the public forms and the site. Nothing
here holds a secret. Never paste a real secret key into a file, a chat or a
ticket; enter it in Vercel only.

## Form security check (Cloudflare Turnstile)

The Contact form and the job application form each have their own switch and
their own keys:

| Form | Switch | Site key | Secret key | Optional host list |
|---|---|---|---|---|
| Contact | `CONTACT_TURNSTILE_MODE` | `CONTACT_TURNSTILE_SITE_KEY` | `CONTACT_TURNSTILE_SECRET_KEY` | `CONTACT_TURNSTILE_ALLOWED_HOSTS` |
| Apply | `APPLY_TURNSTILE_MODE` | `APPLY_TURNSTILE_SITE_KEY` | `APPLY_TURNSTILE_SECRET_KEY` | `APPLY_TURNSTILE_ALLOWED_HOSTS` |

Both ship **off**. With the switch off, a form asks for no token and nothing
calls Cloudflare.

### Turning a form's check on (two steps)

1. In Cloudflare, create a Turnstile widget (mode Managed) for `romega-solutions.com`
   only. It covers `www`. Do not list any `vercel.app` address.
2. In Vercel, set the site key (Config) and the secret key (Secret type,
   Production only). Leave the mode unset. Redeploy. Run `pnpm check:env:production`
   against the pulled Production values; a typo shows up here, before it can block anyone.
3. In a second step set the mode to `on` and redeploy.
4. Send one real test application or message from `https://www.romega-solutions.com`
   (not a `vercel.app` address). The real key refuses other hosts. Try it once on a real phone.

For Preview, use Cloudflare's public test keys only. They are refused in
Production, by the code and by `pnpm check:env:production`.

### Turning it off again

Set the mode to `off` (or delete it) and redeploy. For a faster way back, use
Vercel Instant Rollback to the deployment from before the mode was switched on.

### If the check blocks real people

Every failure message carries an email link (`hr@romega-solutions.com` for
Apply, `info@romega-solutions.com` for Contact), and the form keeps what was typed.
Look at the failure codes in the function logs (`CAPTCHA_REQUIRED`, `CAPTCHA_FAILED`,
`CAPTCHA_UNAVAILABLE`, `CAPTCHA_NOT_CONFIGURED`; Contact uses the lowercase form).
`CAPTCHA_NOT_CONFIGURED` means a setting is wrong, not that visitors are at fault.
Tokens are never logged.

### Rate limit (set in Vercel, not in code)

Add a Vercel Firewall rate-limit rule for `POST` on paths starting `/api/apply/`:
key IP, fixed window 10 minutes, start at 30 requests per window, action **Log**.
After a week of data, switch it to block (429) at about twice the busiest
legitimate IP. Phones on shared mobile connections and offices share one IP, so
a low number would block real applicants. Counters are per region.

## Privacy

The privacy policy names Cloudflare Turnstile and links Cloudflare's Turnstile
Privacy Addendum. The policy's version and date were not changed; whether to
change them is a decision for the site owner.
