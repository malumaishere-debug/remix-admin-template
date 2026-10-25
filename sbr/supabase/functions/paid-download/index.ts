// SBR paid-download — Supabase Edge Function
//
// Replaces the public MEGA links that were embedded in dashboard.html.
// The browser asks for a product ("codex", "afis", "postfraud"); this function
// checks the logged-in user's plan on the server and, only if the plan allows it,
// returns a download link that expires after a short time.
//
// Files live in a PRIVATE Supabase Storage bucket ("paid-products"), so they
// cannot be reached without a valid signed link.
//
// Supabase provides SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
// to every Edge Function automatically. Nothing secret is stored in this file.

export const BUCKET = "paid-products";
export const LINK_TTL_SECONDS = 120;
export const ALLOWED_ORIGINS = ["https://sbr.systems", "https://www.sbr.systems"];

// Same ranks the dashboard already uses (PLANS in dashboard.html).
export const PLAN_RANK: Record<string, number> = {
  free: 0,
  essential: 1,
  basic: 1,
  professional: 2,
  pro: 2,
  premium: 3,
  enterprise: 3,
};

// Minimum plan rank per product, and the file name inside the bucket.
// Ranks mirror what dashboard.html shows today. Change them here, in one place.
export const PRODUCTS: Record<string, { minRank: number; path: string; fileName: string }> = {
  codex: { minRank: 2, path: "codex/SBR-Codex.pdf", fileName: "SBR-Codex.pdf" },
  afis: { minRank: 2, path: "afis/SBR-AFIS.pdf", fileName: "SBR-AFIS.pdf" },
  postfraud: { minRank: 0, path: "postfraud/SBR-Post-Fraud.pdf", fileName: "SBR-Post-Fraud.pdf" },
};

export type Decision =
  | { ok: true; path: string; fileName: string }
  | { ok: false; status: 400 | 403; reason: string };

/** Pure entitlement check: no network, easy to test. */
export function decide(input: {
  resource: unknown;
  plan: string | null | undefined;
  planExpiresAt: string | null | undefined;
  now: Date;
}): Decision {
  const resource = typeof input.resource === "string" ? input.resource : "";
  const product = Object.prototype.hasOwnProperty.call(PRODUCTS, resource) ? PRODUCTS[resource] : undefined;
  if (!product) return { ok: false, status: 400, reason: "unknown_resource" };

  let plan = String(input.plan || "free").toLowerCase().trim();
  if (!Object.prototype.hasOwnProperty.call(PLAN_RANK, plan)) plan = "free";

  // An expired plan counts as free. Null/empty expiry = no expiry (one-time purchase).
  if (input.planExpiresAt) {
    const exp = new Date(input.planExpiresAt);
    if (Number.isNaN(exp.getTime()) || exp.getTime() <= input.now.getTime()) plan = "free";
  }

  if (PLAN_RANK[plan] < product.minRank) return { ok: false, status: 403, reason: "plan_too_low" };
  return { ok: true, path: product.path, fileName: product.fileName };
}

export interface Deps {
  getUserId(authHeader: string): Promise<string | null>;
  getProfile(userId: string): Promise<{ plan: string | null; plan_expires_at: string | null } | null>;
  signUrl(path: string, fileName: string): Promise<string | null>;
  now(): Date;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function makeHandler(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "login_required" }, 401, origin);

    let body: { resource?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad_request" }, 400, origin);
    }

    let userId: string | null = null;
    try {
      userId = await deps.getUserId(auth);
    } catch {
      userId = null;
    }
    if (!userId) return json({ error: "login_required" }, 401, origin);

    let profile: Awaited<ReturnType<Deps["getProfile"]>> = null;
    try {
      profile = await deps.getProfile(userId);
    } catch {
      return json({ error: "server_error" }, 500, origin);
    }

    const d = decide({
      resource: body.resource,
      plan: profile?.plan,
      planExpiresAt: profile?.plan_expires_at,
      now: deps.now(),
    });
    if (!d.ok) return json({ error: d.reason }, d.status, origin);

    let url: string | null = null;
    try {
      url = await deps.signUrl(d.path, d.fileName);
    } catch {
      url = null;
    }
    if (!url) return json({ error: "file_unavailable" }, 503, origin);
    return json({ url, expires_in: LINK_TTL_SECONDS }, 200, origin);
  };
}

async function liveDeps(): Promise<Deps> {
  const { createClient } = await import("npm:@supabase/supabase-js@2");
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service, { auth: { persistSession: false } });

  return {
    async getUserId(authHeader) {
      const userClient = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data, error } = await userClient.auth.getUser();
      return error || !data?.user ? null : data.user.id;
    },
    async getProfile(userId) {
      const { data, error } = await admin
        .from("profiles")
        .select("plan,plan_expires_at")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async signUrl(path, fileName) {
      const { data, error } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(path, LINK_TTL_SECONDS, { download: fileName });
      return error || !data ? null : data.signedUrl;
    },
    now: () => new Date(),
  };
}

// Tests set SBR_TEST=1 so importing this file does not start a server.
if (!Deno.env.get("SBR_TEST")) {
  let handler: ((req: Request) => Promise<Response>) | null = null;
  Deno.serve(async (req) => {
    if (!handler) handler = makeHandler(await liveDeps());
    return handler(req);
  });
}
