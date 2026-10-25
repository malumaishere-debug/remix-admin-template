#!/usr/bin/env python3
"""Read-only snapshot of the public sbr.systems website.

Downloads the pages and the files they use (JS, CSS, images, fonts, JSON) and
undoes the changes Cloudflare makes on the way out (Rocket Loader script types,
e-mail obfuscation), so the copy is as close as possible to what is on the server.

It only makes GET requests to public URLs. It never logs in and never writes to the site.
It cannot see server-only files (.htaccess, PHP, files not linked anywhere).

Usage: python3 sbr/ops/mirror_site.py OUTPUT_DIR
"""
import os
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

SITE = "https://sbr.systems"
HOST = "sbr.systems"
UA = {"User-Agent": "SBR-snapshot/1.0 (owner backup)"}
EXTRA_PAGES = ["/", "/404.html", "/login.html", "/register.html", "/dashboard.html", "/business-dashboard.html",
               "/sbr-ai.html", "/verified.html", "/codex-page.html", "/cost-optimization.html",
               "/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.json", "/site.webmanifest",
               # Loaded by js/risk/media-page.js through string concatenation (BASE + 'c2pa/...'), so not found by scanning.
               "/js/risk/c2pa/sbr-risk-media.js", "/js/risk/c2pa/c2pa_worker.js", "/js/risk/c2pa/c2pa_bg.wasm",
               "/js/risk/trust/C2PA-TRUST-LIST.pem"]
TEXT_EXT = (".html", ".htm", ".js", ".css", ".json", ".xml", ".txt", ".svg", ".webmanifest", "/")


def fetch(path):
    url = SITE + path
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
    except Exception:
        return 0, b""


def cf_decode_email(hexstr):
    data = bytes.fromhex(hexstr)
    return bytes(b ^ data[0] for b in data[1:]).decode("utf-8", "replace")


def clean_html(s):
    # Cloudflare Rocket Loader: restore normal script tags and drop its loader.
    s = re.sub(r'<script[^>]+/cdn-cgi/scripts/[^>]*rocket-loader\.min\.js[^>]*></script>', "", s)
    s = re.sub(r'\stype="[0-9a-f]{20,}-(text/javascript|module|application/ld\+json)"',
               lambda m: "" if m.group(1) == "text/javascript" else f' type="{m.group(1)}"', s)
    # Cloudflare e-mail obfuscation.
    s = re.sub(r'<script[^>]+/cdn-cgi/scripts/[^>]*email-decode\.min\.js[^>]*></script>', "", s)
    s = re.sub(r'<(span|a)[^>]*class="__cf_email__"[^>]*data-cfemail="([0-9a-f]+)"[^>]*>.*?</\1>',
               lambda m: cf_decode_email(m.group(2)), s, flags=re.S)
    s = re.sub(r'/cdn-cgi/l/email-protection#([0-9a-f]+)', lambda m: "mailto:" + cf_decode_email(m.group(1)), s)
    # Scripts Cloudflare injects at the edge (bot challenge, Web Analytics beacon). It adds them again by itself.
    s = re.sub(r'<script>(?:(?!</script>).)*?/cdn-cgi/challenge-platform/(?:(?!</script>).)*</script>', "", s, flags=re.S)
    s = re.sub(r'<script[^>]*data-cf-beacon[^>]*></script>', "", s)
    return s


def is_soft_404(path, body):
    """The server answers 200 with its 404 page for any missing path, even .css/.js/.jpg."""
    if path == "/404.html":
        return False
    head = body[:4000].lstrip()
    return head[:15].lower().startswith(b"<!doctype html") and re.search(rb"<title[^>]*>\s*404\b", head) is not None


def local_refs(text, base_path):
    refs = set()
    pat = r'(?:src|href|data-src|content|action)\s*=\s*["\']([^"\'#]+)["\']|url\(\s*["\']?([^"\')]+)["\']?\s*\)|["\']((?:/|\.\./|\./)?[\w\-/.]+\.(?:js|css|json|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|pdf|xml|webmanifest|mp4|webm)(?:\?[^"\']*)?)["\']'
    for m in re.finditer(pat, text):
        ref = next(g for g in m.groups() if g)
        ref = ref.strip()
        if ref.startswith(("data:", "mailto:", "tel:", "javascript:", "blob:", "//")):
            continue
        if re.search(r"[\s<>{}|\\^`\"&;]", ref) or ("." not in ref.rsplit("/", 1)[-1] and not ref.endswith("/")):
            continue  # meta text, template strings or extension-less words, not file paths
        u = urllib.parse.urlparse(urllib.parse.urljoin(SITE + base_path, ref))
        if u.netloc and u.netloc not in (HOST, "www." + HOST):
            continue
        if u.path.startswith("/cdn-cgi/"):
            continue
        refs.add(urllib.parse.unquote(u.path) or "/")
    return refs


def main(out):
    status, sm = fetch("/sitemap.xml")
    queue = set(EXTRA_PAGES)
    queue |= {urllib.parse.urlparse(u).path or "/" for u in re.findall(r"<loc>([^<]+)</loc>", sm.decode("utf-8", "replace"))}
    seen, saved, missing = set(), [], []
    while queue:
        batch = sorted(queue - seen)
        queue = set()
        seen.update(batch)
        with ThreadPoolExecutor(8) as ex:
            results = list(ex.map(lambda p: (p, *fetch(p)), batch))
        for path, code, body in results:
            if code != 200 or not body:
                missing.append((path, code))
                continue
            is_html = path.endswith((".html", ".htm", "/"))
            if is_soft_404(path, body):
                missing.append((path, "200 + 404 page (soft 404)"))
                continue
            rel = "index.html" if path == "/" else path.lstrip("/")
            if rel.endswith("/"):
                rel += "index.html"
            dest = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dest) or out, exist_ok=True)
            if path.endswith(TEXT_EXT) or is_html:
                text = body.decode("utf-8", "replace")
                if is_html:
                    text = clean_html(text)
                if path.endswith((".html", ".htm", "/", ".js", ".css", ".json", ".webmanifest")):
                    # Relative links inside JS/JSON resolve against the page, not the script's folder.
                    base = path if is_html or path.endswith(".css") else "/"
                    queue |= local_refs(text, base) - seen
                with open(dest, "w", encoding="utf-8", newline="") as f:
                    f.write(text)
            else:
                with open(dest, "wb") as f:
                    f.write(body)
            saved.append(rel)
    with open(os.path.join(out, "SNAPSHOT.md"), "w", encoding="utf-8") as f:
        f.write("# sbr.systems public snapshot\n\nRead-only copy made by `sbr/ops/mirror_site.py`. "
                "It is NOT the server's original files: server-only files (.htaccess, PHP, unlinked files) are missing, "
                "and Cloudflare changes were reversed automatically. Do not upload this folder over the live site.\n\n"
                f"Files saved: {len(saved)}\n\n## Referenced but not downloadable\n\n")
        for p, c in sorted(missing, key=lambda x: str(x[0])):
            f.write(f"- `{p}` → {c}\n")
    print(f"saved {len(saved)} files, {len(missing)} missing -> {out}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "site-snapshot")
