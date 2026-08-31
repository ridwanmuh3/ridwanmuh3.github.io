/**
 * Contact form endpoint. The site is static, so this is the only place a Resend
 * API key can live — and the only thing between a public URL and a mail-sending
 * quota. Every check returns before the next runs; nothing touches Resend until
 * all of them pass.
 *
 * Two rejections answer `{ ok: true }` on purpose: a bot told it failed retries,
 * one told it succeeded goes away. Neither sends mail.
 */

export interface Env {
    /** Secret. `wrangler secret put RESEND_API_KEY`. */
    RESEND_API_KEY: string;
    /** Secret. `wrangler secret put TURNSTILE_SECRET_KEY`. */
    TURNSTILE_SECRET_KEY: string;
    /** Must be the address the Resend account was opened with — see `send()`. */
    CONTACT_TO: string;
    /** Comma-separated origin allowlist. */
    ALLOWED_ORIGINS: string;
    /** Per-IP send counter. Approximate by design — see `sendCount()`. */
    RATE: KVNamespace;
}

interface Submission {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    /** Honeypot. A real visitor never sees this field. */
    company?: unknown;
    /** Epoch ms written by JS when the form rendered. */
    t?: unknown;
    token?: unknown;
}

const MAX_BODY_BYTES = 20 * 1024;
/** A human cannot read the page, type a message, and submit inside this. */
const MIN_FILL_MS = 3_000;
const SEND_CAP_PER_HOUR = 5;
const RATE_WINDOW_SECONDS = 3_600;

const LIMITS = {
    name: { min: 1, max: 100 },
    email: { max: 254 },
    message: { min: 10, max: 5_000 },
} as const;

/* Deliberately loose. The only test that means anything is whether the reply
   arrives, and a rejected-but-valid address costs a real lead. This catches
   typing a name into the email box. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = request.headers.get("Origin");
        const allowed = allowlist(env).has(origin ?? "") ? origin : null;

        if (request.method === "OPTIONS") {
            return preflight(allowed);
        }

        if (request.method !== "POST") {
            return json({ ok: false, error: "method_not_allowed" }, 405, allowed);
        }

        /* An actual rejection, not just absent CORS headers: the browser blocks
           an uncovered response, but curl does not. */
        if (!allowed) {
            return json({ ok: false, error: "forbidden_origin" }, 403, null);
        }

        const declared = Number(request.headers.get("Content-Length") ?? 0);
        if (declared > MAX_BODY_BYTES) {
            return json({ ok: false, error: "too_large" }, 413, allowed);
        }

        const raw = await request.text();
        /* Content-Length can lie or be absent under chunked encoding. */
        if (raw.length > MAX_BODY_BYTES) {
            return json({ ok: false, error: "too_large" }, 413, allowed);
        }

        let body: Submission;
        try {
            body = JSON.parse(raw) as Submission;
        } catch {
            return json({ ok: false, error: "bad_json" }, 400, allowed);
        }

        // Silent rejections. Both look like success and send nothing.

        if (typeof body.company === "string" && body.company.trim() !== "") {
            return json({ ok: true }, 200, allowed);
        }

        /* Lower bound only — a page left open an hour is a normal thing a person
           does; a submission 40ms after render is not. A missing `t` fails this,
           which is correct: the form always sends one. */
        const renderedAt = Number(body.t);
        if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < MIN_FILL_MS) {
            return json({ ok: true }, 200, allowed);
        }

        const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

        /* Read the cap before spending a Turnstile subrequest. Incremented after
           a send succeeds, not here, so someone who fumbles the form five times
           is not locked out — the cap is on mail sent. */
        const sends = await sendCount(env, ip);
        if (sends >= SEND_CAP_PER_HOUR) {
            return json({ ok: false, error: "rate_limited" }, 429, allowed);
        }

        if (!(await turnstileOk(env, body.token, ip))) {
            return json({ ok: false, error: "challenge_failed" }, 403, allowed);
        }

        const fields = validate(body);
        if ("field" in fields) {
            return json({ ok: false, error: "invalid", field: fields.field }, 422, allowed);
        }

        if (!(await send(env, fields))) {
            /* Resend's error text can name the account, the domain, or the key's
               state. None of that belongs in a response anyone can curl. */
            return json({ ok: false, error: "send_failed" }, 502, allowed);
        }

        await bumpSendCount(env, ip, sends);
        return json({ ok: true }, 200, allowed);
    },
} satisfies ExportedHandler<Env>;

// --- CORS ------------------------------------------------------------------

function allowlist(env: Env): Set<string> {
    return new Set(
        env.ALLOWED_ORIGINS.split(",")
            .map((o) => o.trim())
            .filter(Boolean),
    );
}

function corsHeaders(allowed: string | null): Record<string, string> {
    /* `Vary: Origin` always — the response differs per origin, and without it a
       cache can hand one origin's answer to another. */
    const headers: Record<string, string> = { Vary: "Origin" };
    if (allowed) {
        headers["Access-Control-Allow-Origin"] = allowed;
    }
    return headers;
}

function preflight(allowed: string | null): Response {
    return new Response(null, {
        status: allowed ? 204 : 403,
        headers: {
            ...corsHeaders(allowed),
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        },
    });
}

/* Errors carry the CORS headers too — without them the browser will not let the
   page read the failure, and the form can only say "something went wrong". */
function json(payload: unknown, status: number, allowed: string | null): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeaders(allowed),
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}

// --- Rate limit ------------------------------------------------------------

/* KV is eventually consistent, so two requests from one IP can read the same
   count. Acceptable: this bounds a runaway, Turnstile stops automation. Each
   write resets the TTL, making it a sliding hour. */
async function sendCount(env: Env, ip: string): Promise<number> {
    const n = Number(await env.RATE.get(`send:${ip}`));
    return Number.isFinite(n) && n > 0 ? n : 0;
}

async function bumpSendCount(env: Env, ip: string, current: number): Promise<void> {
    await env.RATE.put(`send:${ip}`, String(current + 1), {
        expirationTtl: RATE_WINDOW_SECONDS,
    });
}

// --- Turnstile -------------------------------------------------------------

async function turnstileOk(env: Env, token: unknown, ip: string): Promise<boolean> {
    if (typeof token !== "string" || token === "") return false;

    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET_KEY);
    form.append("response", token);
    form.append("remoteip", ip);

    try {
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: form,
        });
        const data = (await res.json()) as { success?: boolean };
        return data.success === true;
    } catch {
        /* Fail closed. The alternative is an open mail relay for the length of
           the outage. */
        return false;
    }
}

// --- Validation ------------------------------------------------------------

interface Fields {
    name: string;
    email: string;
    message: string;
}

function validate(body: Submission): Fields | { field: keyof Fields } {
    const name = str(body.name);
    const email = str(body.email);
    const message = str(body.message);

    if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
        return { field: "name" };
    }
    if (email.length > LIMITS.email.max || !EMAIL_SHAPE.test(email)) {
        return { field: "email" };
    }
    if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) {
        return { field: "message" };
    }

    return { name, email, message };
}

function str(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

// --- Resend ----------------------------------------------------------------

async function send(env: Env, fields: Fields): Promise<boolean> {
    /* `onboarding@resend.dev` is Resend's shared sender: no domain to own, no
       DKIM to publish. Its one restriction — it can only deliver to the address
       the account was opened with — is exactly this use case. Swapping in a
       verified domain later means changing this string and nothing else.

       The visitor's address goes in `reply_to`, never `from`: `from` would be
       sending mail as someone else, which SPF and DKIM exist to stop. */
    const payload = {
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [env.CONTACT_TO],
        reply_to: fields.email,
        subject: `Portfolio contact - ${fields.name}`,
        /* Plain text: nothing the visitor typed is interpolated into markup, so
           there is no markup for it to break out of. */
        text: [`From: ${fields.name} <${fields.email}>`, "", fields.message].join("\n"),
    };

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            /* Status only — the body can quote the submission back, and these
               logs are readable by anyone with dashboard access. */
            console.error(`resend rejected: ${res.status}`);
            return false;
        }
        return true;
    } catch (err) {
        console.error(`resend unreachable: ${err instanceof Error ? err.name : "unknown"}`);
        return false;
    }
}
