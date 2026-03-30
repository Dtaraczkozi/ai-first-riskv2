#!/usr/bin/env python3
"""
update-icons.py — Icon build tool for riskmanager-aifirst-proto
================================================================
Reads every .svg file in icons/ (except sprite.svg), then:
  1. Regenerates icons/sprite.svg
  2. Hot-swaps the <!-- SPRITE-START/END --> block in index.html

Usage
-----
  # Rebuild from existing icons/ folder
  python3 scripts/update-icons.py

  # Add a new icon (copies file + rebuilds)
  python3 scripts/update-icons.py --add my-icon path/to/source.svg

  # List all current icons
  python3 scripts/update-icons.py --list

Icon file rules
---------------
  • Place a 24×24 SVG in icons/<name>.svg
  • The filename (without .svg) becomes the id: icon-<name>
  • Use fill="currentColor" so CSS colour tokens apply
  • viewBox is read from the file; defaults to "0 0 24 24"
"""

import argparse
import os
import re
import shutil
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).parent.parent
ICONS_DIR  = ROOT / "icons"
SPRITE_OUT = ICONS_DIR / "sprite.svg"
HTML_FILE  = ROOT / "index.html"

SPRITE_START = "<!-- SPRITE-START -->"
SPRITE_END   = "<!-- SPRITE-END -->"

# ── Helpers ───────────────────────────────────────────────────────────────────

def collect_icons():
    """Return sorted list of (name, Path) for every icon SVG (excl. sprite)."""
    files = sorted(
        p for p in ICONS_DIR.glob("*.svg")
        if p.name != "sprite.svg"
    )
    return [(p.stem, p) for p in files]


def parse_svg(path: Path):
    """Return (viewBox, inner_xml_string) for a single SVG file."""
    tree = ET.parse(path)
    root = tree.getroot()

    # Strip namespace prefix if present
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"

    viewbox = root.get("viewBox", "0 0 24 24")

    # Serialise child elements, stripping namespace prefixes for brevity
    inner_parts = []
    for child in root:
        raw = ET.tostring(child, encoding="unicode")
        # Remove namespace prefix in tag names: {ns}path → path
        raw = re.sub(r"<(\w+:)?(\w+)\s", r"<\2 ", raw)
        raw = re.sub(r"</(\w+:)?(\w+)>",  r"</\2>", raw)
        # Strip xmlns:* attributes injected by ElementTree serialisation
        raw = re.sub(r' xmlns:\w+="[^"]*"', "", raw)
        inner_parts.append("    " + raw)

    return viewbox, "\n".join(inner_parts)


def build_sprite(icons):
    """Return the full sprite.svg string from a list of (name, path) pairs."""
    lines = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">']
    for name, path in icons:
        viewbox, inner = parse_svg(path)
        lines.append(f'  <symbol id="icon-{name}" viewBox="{viewbox}">')
        lines.append(inner)
        lines.append("  </symbol>")
    lines.append("</svg>")
    return "\n".join(lines) + "\n"


def build_html_block(sprite_content):
    """Wrap sprite content with sentinel comments for embedding in HTML."""
    return (
        f"{SPRITE_START}\n"
        f"{sprite_content}"
        f"{SPRITE_END}"
    )


def update_html(sprite_content):
    """Replace the SPRITE-START … SPRITE-END block in index.html."""
    html = HTML_FILE.read_text()

    start_idx = html.find(SPRITE_START)
    end_idx   = html.find(SPRITE_END)

    if start_idx == -1 or end_idx == -1:
        print("⚠  Sentinel markers not found in index.html — skipping HTML update.")
        print("   Add <!-- SPRITE-START --> and <!-- SPRITE-END --> around the sprite block.")
        return False

    end_idx += len(SPRITE_END)
    new_html = html[:start_idx] + build_html_block(sprite_content) + html[end_idx:]
    HTML_FILE.write_text(new_html)
    return True


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_rebuild():
    icons = collect_icons()
    if not icons:
        print("No SVG files found in icons/")
        sys.exit(1)

    sprite = build_sprite(icons)
    SPRITE_OUT.write_text(sprite)
    print(f"✓  icons/sprite.svg  ({len(icons)} icons)")

    if update_html(sprite):
        print(f"✓  index.html sprite block updated")

    print(f"\nIcons ({len(icons)}):")
    for name, _ in icons:
        print(f"   icon-{name}")


def cmd_add(name: str, source: str):
    src = Path(source)
    if not src.exists():
        print(f"✗  Source file not found: {source}")
        sys.exit(1)

    dest = ICONS_DIR / f"{name}.svg"
    shutil.copy(src, dest)
    print(f"✓  Copied → icons/{name}.svg")
    cmd_rebuild()


def cmd_list():
    icons = collect_icons()
    if not icons:
        print("No icons found.")
        return
    print(f"{len(icons)} icons in icons/:")
    for name, path in icons:
        print(f"   icon-{name}  ({path.name})")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Rebuild the SVG icon sprite and update index.html."
    )
    sub = parser.add_subparsers(dest="cmd")

    p_add = sub.add_parser("add", help="Add a new icon and rebuild")
    p_add.add_argument("name",   help="Icon name, e.g. my-icon  → id: icon-my-icon")
    p_add.add_argument("source", help="Path to the source .svg file")

    sub.add_parser("list", help="List all current icons")

    args = parser.parse_args()

    if args.cmd == "add":
        cmd_add(args.name, args.source)
    elif args.cmd == "list":
        cmd_list()
    else:
        cmd_rebuild()


if __name__ == "__main__":
    main()
