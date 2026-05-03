"""
Converte todas as imagens em public/ pra WebP (mantém originais como fallback).

Estratégia:
  - WebP quality 80 (sweet spot: ~50-60% economia vs JPG sem perda visível)
  - Resize: cap em 1600px no eixo maior (>1600 é desperdício pra display web)
  - Mantém originais .jpg/.png na pasta (fallback pra CSS image-set)
  - Idempotente: pula arquivos .webp já existentes que são mais novos que origem

Run: python tools/convert_webp.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
QUALITY = 80
MAX_DIM = 1600
SKIP_DIRS = {"og.jpg"}  # og.jpg já é otimizada e usada por scrapers que não suportam WebP

total_orig = 0
total_webp = 0
converted = 0
skipped = 0
errors = []

for img_path in PUBLIC.rglob("*"):
    if img_path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    if img_path.name in SKIP_DIRS:
        continue
    webp_path = img_path.with_suffix(".webp")

    # Idempotência: pula se webp já é mais novo que origem
    if webp_path.exists() and webp_path.stat().st_mtime >= img_path.stat().st_mtime:
        skipped += 1
        total_orig += img_path.stat().st_size
        total_webp += webp_path.stat().st_size
        continue

    try:
        with Image.open(img_path) as im:
            # Garante RGB (descarta alpha se PNG não-transparente · WebP suporta alpha mas RGB economiza)
            if im.mode == "RGBA":
                # Mantém alpha pra logos, converte pra RGB pra fotos
                if "logo" in str(img_path):
                    pass  # mantém RGBA
                else:
                    im = im.convert("RGB")
            elif im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGB")

            # Resize se exceder MAX_DIM
            if max(im.size) > MAX_DIM:
                ratio = MAX_DIM / max(im.size)
                new_size = (int(im.size[0] * ratio), int(im.size[1] * ratio))
                im = im.resize(new_size, Image.LANCZOS)

            im.save(webp_path, "WEBP", quality=QUALITY, method=6)

        orig_size = img_path.stat().st_size
        webp_size = webp_path.stat().st_size
        total_orig += orig_size
        total_webp += webp_size
        converted += 1
        rel = img_path.relative_to(PUBLIC)
        savings = (1 - webp_size / orig_size) * 100
        print(f"  {rel}  {orig_size//1024}KB -> {webp_size//1024}KB  ({savings:+.0f}%)")
    except Exception as e:
        errors.append((str(img_path), str(e)))
        print(f"  ERROR {img_path}: {e}")

print()
print(f"converted: {converted}  skipped: {skipped}  errors: {len(errors)}")
print(f"total: {total_orig//1024}KB -> {total_webp//1024}KB  ({(1-total_webp/total_orig)*100:+.0f}%)" if total_orig else "no images")
