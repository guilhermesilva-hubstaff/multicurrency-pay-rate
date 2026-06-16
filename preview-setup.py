"""
Run this once after cloning to generate .claude/launch.json.
The Claude Code preview tool spawns its server in a sandboxed environment
where getcwd() is blocked, so standard http.server fails. This script bakes
the static files into an in-memory HTTP server embedded in the launch config.

Usage:
    python3 preview-setup.py
"""

import base64, gzip, json, os

TEMPLATE_DIR = os.path.dirname(os.path.abspath(__file__))
# Write to the parent project root so Claude Code's preview tool finds it
LAUNCH_DIR   = os.path.join(os.path.dirname(TEMPLATE_DIR), ".claude")
LAUNCH_PATH  = os.path.join(LAUNCH_DIR, "launch.json")

SERVE_FILES = {
    "/index.html":              ("index.html",              "text/html; charset=utf-8"),
    "/members.html":            ("members.html",            "text/html; charset=utf-8"),
    "/member-detail.html":      ("member-detail.html",      "text/html; charset=utf-8"),
    "/hubstaff-shell.js":       ("hubstaff-shell.js",       "application/javascript"),
    "/layout.js":               ("layout.js",               "application/javascript"),
    "/design-annotations.js":   ("design-annotations.js",   "application/javascript"),
    "/design-tasks.js":         ("design-tasks.js",         "application/javascript"),
    "/styles.css":              ("styles.css",              "text/css"),
    "/members.css":             ("members.css",             "text/css"),
    "/member-detail.css":       ("member-detail.css",       "text/css"),
    "/project-detail.css":      ("project-detail.css",      "text/css"),
    "/payroll.html":            ("payroll.html",            "text/html; charset=utf-8"),
    "/payroll.css":             ("payroll.css",             "text/css"),
    "/epr.css":                 ("epr.css",                 "text/css"),
    "/projects.html":           ("projects.html",           "text/html; charset=utf-8"),
    "/projects.css":            ("projects.css",            "text/css"),
    "/project-detail.html":     ("project-detail.html",     "text/html; charset=utf-8"),
    "/amounts-owed.html":       ("amounts-owed.html",       "text/html; charset=utf-8"),
    "/amounts-owed.css":        ("amounts-owed.css",        "text/css"),
    "/payments.html":           ("payments.html",           "text/html; charset=utf-8"),
    "/payments.css":            ("payments.css",            "text/css"),
    "/payment-records.html":    ("payment-records.html",    "text/html; charset=utf-8"),
    "/payment-records.css":     ("payment-records.css",     "text/css"),
    "/team-payment.html":       ("team-payment.html",       "text/html; charset=utf-8"),
    "/team-payment.css":        ("team-payment.css",        "text/css"),
    "/payroll-adjustments.html": ("payroll-adjustments.html", "text/html; charset=utf-8"),
    "/payroll-adjustments.css":  ("payroll-adjustments.css",  "text/css"),
}

def build_launch_json():
    store = {}
    for url, (filename, ctype) in SERVE_FILES.items():
        path = os.path.join(TEMPLATE_DIR, filename)
        with open(path, "rb") as f:
            raw = f.read()
        store[url] = [base64.b64encode(gzip.compress(raw)).decode(), ctype]
    store["/"] = store["/index.html"]

    payload = base64.b64encode(json.dumps(store).encode()).decode()

    server_code = (
        "import sys;sys.path=[p for p in sys.path if p];"
        "import base64,gzip,json,os;"
        "D=json.loads(base64.b64decode('%s'));" % payload +
        "\nfrom http.server import HTTPServer,BaseHTTPRequestHandler\n"
        "class H(BaseHTTPRequestHandler):\n"
        " def log_message(self,*a):pass\n"
        " def do_GET(self):\n"
        "  p=self.path.split('?')[0]\n"
        "  e=D.get(p)\n"
        "  if not e:\n"
        "   self.send_response(404);self.end_headers();self.wfile.write(b'Not found');return\n"
        "  body=gzip.decompress(base64.b64decode(e[0]))\n"
        "  self.send_response(200);"
        "self.send_header('Content-Type',e[1]);"
        "self.send_header('Content-Length',str(len(body)));"
        "self.end_headers();self.wfile.write(body)\n"
        "HTTPServer(('127.0.0.1',int(os.environ.get('PORT','8000'))),H).serve_forever()\n"
    )

    config = {
        "version": "0.0.1",
        "configurations": [
            {
                "name": "hubstaff-shell",
                "runtimeExecutable": "python3",
                "runtimeArgs": ["-c", server_code],
                "port": 8000,
                "autoPort": False,
            }
        ],
    }

    os.makedirs(LAUNCH_DIR, exist_ok=True)
    with open(LAUNCH_PATH, "w") as f:
        json.dump(config, f, indent=2)

    print(f"✓  Written: {LAUNCH_PATH}")
    print("   Next: in Claude Code, the preview will start automatically,")
    print("   or call preview_start('hubstaff-shell') manually.")

if __name__ == "__main__":
    build_launch_json()
