"""
Converte os inline `style="background-image:url('X.jpg');background-image:image-set(...)"`
em `data-bg-jpg="X.jpg" data-bg-webp="X.webp"` pra IntersectionObserver lazy-load.

Hero (.va-foto) PERMANECE eager — above-fold critical LCP element.
Tudo abaixo do fold (cases_final, cases_slider, conquistas) vira lazy.

Run: python tools/lazy_swap.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "public" / "index.html"

src = HTML.read_text(encoding="utf-8")

# Pattern: style="background-image:url('FOO.jpg');background-image:image-set(url('FOO.webp')..."
# Captura: caminho base + extensão .jpg/.png
pattern = re.compile(
    r"""style="background-image:url\('([^']+?)\.(jpg|jpeg|png)'\);"""
    r"""background-image:image-set\(url\('[^']+\.webp'\) type\('image/webp'\),"""
    r"""url\('[^']+\.(?:jpg|jpeg|png)'\) type\('image/(?:jpeg|png)'\)\);?\""""
)

def swap(m: re.Match) -> str:
    base = m.group(1)
    ext = m.group(2)
    return f'data-bg-jpg="{base}.{ext}" data-bg-webp="{base}.webp"'

new = pattern.sub(swap, src)

count = src.count("data-bg-jpg=") if "data-bg-jpg=" in src else 0
new_count = new.count("data-bg-jpg=")

HTML.write_text(new, encoding="utf-8")
print(f"OK · {new_count - count} inline backgrounds swapped to data-bg-* (lazy-ready)")
