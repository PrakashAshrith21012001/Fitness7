"""Regenerates web/src/lib/blur.ts from web/public/photos. Run from web/: python scripts/blur.py"""
from PIL import Image
import base64, io, glob, os

out = {}
for f in sorted(glob.glob("public/photos/**/*.jpg", recursive=True)):
    im = Image.open(f).convert("RGB")
    im.thumbnail((10, 10))
    b = io.BytesIO()
    im.save(b, "WEBP", quality=40)
    out["/" + os.path.relpath(f, "public").replace(os.sep, "/")] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
lines = ["/**", " * Tiny blurred previews (10 px WebP) for every photo in web/public/photos,", " * shown while the real image loads so cards never flash empty (BlurHash-style).", " * Regenerate when a photo changes: web/scripts/blur.py.", " */", "export const BLUR: Record<string, string> = {"]
lines += [f'  "{k}": "{v}",' for k, v in out.items()]
lines.append("};\n")
open("src/lib/blur.ts", "w").write("\n".join(lines))
print(f"{len(out)} previews written")
