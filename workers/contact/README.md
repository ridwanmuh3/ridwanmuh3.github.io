# Contact endpoint

Cloudflare Worker behind the contact form on `/contact/`. The site is static, so
this is the only place a Resend API key can live.

`src/index.ts` is a gate: origin allowlist → body size → honeypot → time-on-form
→ per-IP send cap → Turnstile → field validation → Resend. Nothing reaches
Resend until every check passes. The honeypot and timing rejections answer
`{ ok: true }` on purpose — a bot told it failed retries, one told it succeeded
does not — and neither sends mail.

## One-time setup

1. **Resend** — create an account at resend.com using the address the form
   should deliver to, and create an API key. The `from` is
   `onboarding@resend.dev`, Resend's shared sender, which needs no domain but
   can only deliver to that signup address. That is exactly the use case here,
   since the only recipient is you. `CONTACT_TO` in `wrangler.toml` must match
   it.

2. **Turnstile** — Cloudflare dashboard → Turnstile → add a widget in
   **Managed** mode for `ridwanmuh3.github.io`. Keep both keys: the *site* key
   is public and goes in `hugo.toml` (`params.contact.turnstileSiteKey`), the
   *secret* key is a Worker secret.

3. **KV namespace** for the send counter:

   ```
   npx wrangler kv namespace create RATE
   ```

   Paste the printed id into `wrangler.toml`.

4. **Secrets** (never in `wrangler.toml`, which is committed):

   ```
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```

5. **Deploy**, then put the printed `*.workers.dev` URL into `hugo.toml` as
   `params.contact.endpoint`:

   ```
   npx wrangler deploy
   ```

## Local development

```
cp .dev.vars.example .dev.vars   # then fill in RESEND_API_KEY
npx wrangler dev
```

`.dev.vars.example` ships Cloudflare's published always-passes Turnstile test
secret, so the full path is exercisable without a real challenge. Pair it with
the matching test site key `1x00000000000000000000AA` in `hugo.toml` and the
widget will solve itself.

`wrangler dev` serves on `http://localhost:8787`; point
`params.contact.endpoint` there while testing.

## Checking the gate

With `wrangler dev` running:

```sh
E=http://localhost:8787
OK='-H "Origin: http://localhost:1313" -H "Content-Type: application/json"'

# 403 — origin not on the allowlist
curl -s -o /dev/null -w '%{http_code}\n' -X POST $E \
  -H 'Origin: https://evil.example' -H 'Content-Type: application/json' -d '{}'

# 200, no mail — honeypot filled
curl -s -X POST $E -H 'Origin: http://localhost:1313' -H 'Content-Type: application/json' \
  -d '{"company":"bot","name":"a","email":"a@b.co","message":"..........","t":0}'

# 200, no mail — submitted too fast
curl -s -X POST $E -H 'Origin: http://localhost:1313' -H 'Content-Type: application/json' \
  -d "{\"name\":\"a\",\"email\":\"a@b.co\",\"message\":\"..........\",\"t\":$(date +%s000)}"

# 422 with {"field":"message"} — message under 10 characters
curl -s -X POST $E -H 'Origin: http://localhost:1313' -H 'Content-Type: application/json' \
  -d '{"name":"a","email":"a@b.co","message":"hi","t":1,"token":"x"}'
```

The send cap (5/hour/IP) counts successful sends only, so a visitor who fumbles
the form repeatedly is never locked out.
