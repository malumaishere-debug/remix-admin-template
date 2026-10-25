// Run: SBR_TEST=1 deno test --allow-env sbr/supabase/functions/paid-download/
import { assertEquals } from "jsr:@std/assert@1";
import { decide, makeHandler, type Deps } from "./index.ts";

const NOW = new Date("2026-10-25T12:00:00Z");

Deno.test("free user cannot get Codex or AFIS", () => {
  assertEquals(decide({ resource: "codex", plan: "free", planExpiresAt: null, now: NOW }).ok, false);
  assertEquals(decide({ resource: "afis", plan: null, planExpiresAt: null, now: NOW }).ok, false);
});

Deno.test("essential cannot get Codex, professional and premium can", () => {
  assertEquals(decide({ resource: "codex", plan: "essential", planExpiresAt: null, now: NOW }).ok, false);
  assertEquals(decide({ resource: "codex", plan: "Professional", planExpiresAt: null, now: NOW }).ok, true);
  assertEquals(decide({ resource: "afis", plan: "premium", planExpiresAt: null, now: NOW }).ok, true);
  assertEquals(decide({ resource: "afis", plan: "pro", planExpiresAt: null, now: NOW }).ok, true);
});

Deno.test("post-fraud stays available to every logged-in user (same as today)", () => {
  assertEquals(decide({ resource: "postfraud", plan: "free", planExpiresAt: null, now: NOW }).ok, true);
});

Deno.test("expired plan is treated as free", () => {
  const d = decide({ resource: "codex", plan: "premium", planExpiresAt: "2026-10-01T00:00:00Z", now: NOW });
  assertEquals(d, { ok: false, status: 403, reason: "plan_too_low" });
  assertEquals(decide({ resource: "codex", plan: "premium", planExpiresAt: "2027-01-01T00:00:00Z", now: NOW }).ok, true);
  assertEquals(decide({ resource: "codex", plan: "premium", planExpiresAt: "not-a-date", now: NOW }).ok, false);
});

Deno.test("unknown plan names and unknown or tricky resources are rejected", () => {
  assertEquals(decide({ resource: "codex", plan: "superadmin", planExpiresAt: null, now: NOW }).ok, false);
  assertEquals(decide({ resource: "../secret", plan: "premium", planExpiresAt: null, now: NOW }).ok, false);
  assertEquals(decide({ resource: "__proto__", plan: "premium", planExpiresAt: null, now: NOW }).ok, false);
  assertEquals(decide({ resource: 42, plan: "premium", planExpiresAt: null, now: NOW }).ok, false);
});

function fakeDeps(plan: string | null, opts: Partial<Deps> = {}): Deps & { signed: string[] } {
  const signed: string[] = [];
  return {
    signed,
    getUserId: async (h) => (h === "Bearer good" ? "user-1" : null),
    getProfile: async () => ({ plan, plan_expires_at: null }),
    signUrl: async (path) => {
      signed.push(path);
      return "https://example.test/signed/" + path;
    },
    now: () => NOW,
    ...opts,
  };
}

function post(body: unknown, auth = "Bearer good"): Request {
  return new Request("https://fn.test/paid-download", {
    method: "POST",
    headers: { Authorization: auth, Origin: "https://sbr.systems", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.test("handler: no login -> 401, nothing signed", async () => {
  const deps = fakeDeps("premium");
  const h = makeHandler(deps);
  assertEquals((await h(post({ resource: "codex" }, ""))).status, 401);
  assertEquals((await h(post({ resource: "codex" }, "Bearer bad"))).status, 401);
  assertEquals(deps.signed.length, 0);
});

Deno.test("handler: low plan -> 403, nothing signed", async () => {
  const deps = fakeDeps("essential");
  const res = await makeHandler(deps)(post({ resource: "codex" }));
  assertEquals(res.status, 403);
  assertEquals(deps.signed.length, 0);
});

Deno.test("handler: paid plan -> 200 with short-lived link", async () => {
  const deps = fakeDeps("professional");
  const res = await makeHandler(deps)(post({ resource: "afis" }));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.url, "https://example.test/signed/afis/SBR-AFIS.pdf");
  assertEquals(body.expires_in, 120);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "https://sbr.systems");
  assertEquals(res.headers.get("Cache-Control"), "no-store");
});

Deno.test("handler: missing profile -> treated as free", async () => {
  const deps = fakeDeps(null, { getProfile: async () => null });
  assertEquals((await makeHandler(deps)(post({ resource: "codex" }))).status, 403);
});

Deno.test("handler: file missing in storage -> 503", async () => {
  const deps = fakeDeps("premium", { signUrl: async () => null });
  assertEquals((await makeHandler(deps)(post({ resource: "codex" }))).status, 503);
});

Deno.test("handler: CORS preflight and wrong method", async () => {
  const h = makeHandler(fakeDeps("premium"));
  const pre = await h(new Request("https://fn.test", { method: "OPTIONS", headers: { Origin: "https://evil.example" } }));
  assertEquals(pre.status, 204);
  assertEquals(pre.headers.get("Access-Control-Allow-Origin"), "https://sbr.systems");
  assertEquals((await h(new Request("https://fn.test", { method: "GET" }))).status, 405);
});

Deno.test("handler: invalid JSON -> 400", async () => {
  const h = makeHandler(fakeDeps("premium"));
  const req = new Request("https://fn.test", { method: "POST", headers: { Authorization: "Bearer good" }, body: "{" });
  assertEquals((await h(req)).status, 400);
});
