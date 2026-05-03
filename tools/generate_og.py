"""
Gera public/og.jpg (1200x630) — preview social pra LinkedIn/X/Meta/WhatsApp.

Composição:
  - Fundo #0A0A0A
  - Eyebrow MONO dourado "MÉTODO ALTA PERFORMANCE"
  - Headline Anton "POSTURA PRIMEIRO. / ESTÉTICA COMO / CONSEQUÊNCIA."
  - Subtitle Inter "Personal trainer alto padrão · São Paulo"
  - Bottom-right: símbolo VA dourado simples + "victoramin.com"
  - Borda dourada 4px no topo

Run: python tools/generate_og.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og.jpg"
ANTON = ROOT / "tools" / "fonts" / "Anton-Regular.ttf"
INTER = ROOT / "tools" / "fonts" / "Inter.ttf"

W, H = 1200, 630
BG = (10, 10, 10)
GOLD = (255, 204, 0)
FG = (245, 244, 240)
SUBTLE = (138, 134, 128)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Borda dourada topo
d.rectangle([(0, 0), (W, 4)], fill=GOLD)

# Padding
PAD_X = 64
PAD_Y = 64

# Eyebrow mono — usa Inter como fallback (mono não está no asset)
font_eyebrow = ImageFont.truetype(str(INTER), 18)
eyebrow = "MÉTODO ALTA PERFORMANCE"
d.text((PAD_X, PAD_Y), eyebrow, font=font_eyebrow, fill=GOLD)

# Headline — Anton 96pt, 3 linhas com tracking apertado
font_headline = ImageFont.truetype(str(ANTON), 96)
lines = ["POSTURA PRIMEIRO.", "ESTÉTICA COMO", "CONSEQUÊNCIA."]
y = PAD_Y + 60
for line in lines:
    d.text((PAD_X, y), line, font=font_headline, fill=FG)
    y += 100

# Subtitle Inter
font_sub = ImageFont.truetype(str(INTER), 24)
sub = "Personal trainer alto padrão · São Paulo"
d.text((PAD_X, y + 16), sub, font=font_sub, fill=SUBTLE)

# Bottom-right · domínio + símbolo VA simples (retângulo dourado com "VA")
font_va = ImageFont.truetype(str(ANTON), 56)
font_dom = ImageFont.truetype(str(INTER), 22)

# símbolo VA: caixa dourada 80x80 com "VA" preto
va_x = W - 80 - PAD_X
va_y = H - 80 - PAD_Y
d.rectangle([(va_x, va_y), (va_x + 80, va_y + 80)], fill=GOLD)
# centraliza VA dentro da caixa
va_text = "VA"
bbox = d.textbbox((0, 0), va_text, font=font_va)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
# ajuste vertical visual (Anton tem alta x-height, descer um pouco)
d.text((va_x + (80 - tw) / 2 - bbox[0], va_y + (80 - th) / 2 - bbox[1] - 4), va_text, font=font_va, fill=BG)

# domínio embaixo do símbolo
dom = "victoramin.com"
bbox_dom = d.textbbox((0, 0), dom, font=font_dom)
dw = bbox_dom[2] - bbox_dom[0]
d.text((va_x + 80 - dw, va_y + 80 + 12), dom, font=font_dom, fill=GOLD)

# Salva como JPG quality 88 (boa qualidade · ~120-180KB esperado)
img.save(OUT, "JPEG", quality=88, optimize=True)
size_kb = OUT.stat().st_size / 1024
print(f"OK · {OUT} · {W}x{H} · {size_kb:.1f} KB")
