"""
Transforma in-place todos os `background-image:url('X.jpg')` em
`background-image:url('X.jpg');background-image:image-set(url('X.webp') type('image/webp'),url('X.jpg') type('image/jpeg'))`.

Idempotente: pula se já contém o image-set.
Run: python tools/webp_swap.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "public" / "index.html"

src = HTML.read_text(encoding="utf-8")

pattern = re.compile(r"background-image:url\('([^']+?)\.(jpg|jpeg|png)'\)")

def swap(m: re.Match) -> str:
    base = m.group(1)
    ext = m.group(2)
    jpg_url = f"{base}.{ext}"
    webp_url = f"{base}.webp"
    return (
        f"background-image:url('{jpg_url}');"
        f"background-image:image-set(url('{webp_url}') type('image/webp'),url('{jpg_url}') type('image/{ext.replace('jpg','jpeg').replace('jpeg','jpeg').replace('png','png')}'))"
    )

new = pattern.sub(swap, src)

# Não duplica: se já houver image-set, pula
if "image-set(" in src and src.count("image-set(") > 0 and src == new:
    print("Already swapped — skip")
else:
    HTML.write_text(new, encoding="utf-8")
    diff = new.count("image-set(") - src.count("image-set(")
    print(f"OK · {diff} background-image rules upgraded to image-set with WebP fallback")
