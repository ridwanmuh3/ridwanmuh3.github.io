export interface Env {
    RESEND_API_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    CONTACT_TO: string;
    ALLOWED_ORIGINS: string;
    RATE: KVNamespace;
}

interface Submission {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    company?: unknown;
    t?: unknown;
    token?: unknown;
}

const MAX_BODY_BYTES = 20 * 1024;
const MIN_FILL_MS = 3_000;
const SEND_CAP_PER_HOUR = 5;
const RATE_WINDOW_SECONDS = 3_600;

const LIMITS = {
    name: { min: 1, max: 100 },
    email: { max: 254 },
    message: { min: 10, max: 5_000 },
} as const;

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

        if (!allowed) {
            return json({ ok: false, error: "forbidden_origin" }, 403, null);
        }

        const declared = Number(request.headers.get("Content-Length") ?? 0);
        if (declared > MAX_BODY_BYTES) {
            return json({ ok: false, error: "too_large" }, 413, allowed);
        }

        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) {
            return json({ ok: false, error: "too_large" }, 413, allowed);
        }

        let body: Submission;
        try {
            body = JSON.parse(raw) as Submission;
        } catch {
            return json({ ok: false, error: "bad_json" }, 400, allowed);
        }

        // Bot rejections answer { ok: true } so a bot told it succeeded goes away.
        if (typeof body.company === "string" && body.company.trim() !== "") {
            return json({ ok: true }, 200, allowed);
        }

        const renderedAt = Number(body.t);
        if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < MIN_FILL_MS) {
            return json({ ok: true }, 200, allowed);
        }

        const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

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
            return json({ ok: false, error: "send_failed" }, 502, allowed);
        }

        await bumpSendCount(env, ip, sends);
        return json({ ok: true }, 200, allowed);
    },
} satisfies ExportedHandler<Env>;

function allowlist(env: Env): Set<string> {
    return new Set(
        env.ALLOWED_ORIGINS.split(",")
            .map((o) => o.trim())
            .filter(Boolean),
    );
}

function corsHeaders(allowed: string | null): Record<string, string> {
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

// Errors carry CORS headers too, or the browser hides the failure from the page.
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

async function sendCount(env: Env, ip: string): Promise<number> {
    const n = Number(await env.RATE.get(`send:${ip}`));
    return Number.isFinite(n) && n > 0 ? n : 0;
}

async function bumpSendCount(env: Env, ip: string, current: number): Promise<void> {
    await env.RATE.put(`send:${ip}`, String(current + 1), {
        expirationTtl: RATE_WINDOW_SECONDS,
    });
}

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
        return false;
    }
}

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

async function send(env: Env, fields: Fields): Promise<boolean> {
    const payload = {
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [env.CONTACT_TO],
        reply_to: fields.email,
        subject: `Portfolio contact - ${fields.name}`,
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
            console.error(`resend rejected: ${res.status}`);
            return false;
        }
        return true;
    } catch (err) {
        console.error(`resend unreachable: ${err instanceof Error ? err.name : "unknown"}`);
        return false;
    }
}
