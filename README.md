A GitHub Actions workflow runs on every push, scans the repo, writes `manifest.json`, and commits it back. The page fetches that file on load.

You'll need three files:

Drop them into your repo like this:

```
your-repo/
├── index.html
├── generate_manifest.py
└── .github/
    └── workflows/
        └── generate-manifest.yml
```

**How it works:**

1. You push to `main`
2. Actions runs `generate_manifest.py` — it walks the repo, skips `.git`, `.github`, and build artifacts, sanitizes folder names
3. Commits `manifest.json` back automatically
4. `index.html` fetches `manifest.json` on load and renders the directory

**Nested folders** are supported — they render as collapsible rows inside their parent column (click to expand/collapse).

**To customize what gets ignored**, edit the `IGNORE`, `IGNORE_FILES`, and `IGNORE_EXT` sets at the top of `generate_manifest.py`. Right now it filters out `.yml`, `.yaml`, `.py`, `.sh` and common noise files.
