#!/usr/bin/env python3
import os, json, re

ROOT = "."
IGNORE = {".git", ".github", "node_modules", "__pycache__"}
IGNORE_FILES = {"manifest.json", "generate_manifest.py", ".gitignore", "README.md"}
IGNORE_EXT = {".yml", ".yaml", ".sh", ".py"}

def sanitize(name):
    name = re.sub(r'[-_]+', ' ', name)
    return ' '.join(w.capitalize() for w in name.split())

def scan(path, depth=0):
    entries = []
    try:
        items = sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name.lower()))
    except PermissionError:
        return entries

    for entry in items:
        if entry.name.startswith('.') or entry.name in IGNORE:
            continue
        if entry.is_dir():
            children = scan(entry.path, depth + 1)
            entries.append({
                "type": "folder",
                "name": entry.name,
                "label": sanitize(entry.name),
                "children": children
            })
        elif entry.is_file():
            _, ext = os.path.splitext(entry.name)
            if entry.name in IGNORE_FILES or ext in IGNORE_EXT:
                continue
            entries.append({
                "type": "file",
                "name": entry.name,
                "label": sanitize(os.path.splitext(entry.name)[0]),
                "path": os.path.relpath(entry.path, ROOT).replace("\\", "/")
            })
    return entries

manifest = scan(ROOT)
with open("manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)

print(f"manifest.json written ({len(manifest)} top-level entries)")
