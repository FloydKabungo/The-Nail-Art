"""Optional local enhancement of verified authentic store assets.
Requires: pip install requests Pillow
Copies 2x resized images via Lanczos + subtle sharpening.
This is interpolation, not AI super-resolution or recovery of missing details.
"""
from pathlib import Path
from io import BytesIO
import json
import requests
from PIL import Image, ImageFilter
BASE=Path(__file__).resolve().parent
source=json.loads((BASE/'assets/image-sources.json').read_text())['images']
out=BASE/'assets'/'upscaled'
out.mkdir(parents=True,exist_ok=True)
results={}
for photo in source:
    try:
        response=requests.get(photo['url'],timeout=30,headers={'User-Agent':'Mozilla/5.0 (compatible; ProductImageEnhancer/1.0)'})
        response.raise_for_status()
        im=Image.open(BytesIO(response.content)).convert('RGB')
        original=im.size
        im=im.resize((im.width*2,im.height*2),Image.Resampling.LANCZOS)
        im=im.filter(ImageFilter.UnsharpMask(radius=1.2,percent=108,threshold=3))
        filename=f"{photo['id']}-2x.jpg"
        im.save(out/filename,quality=92,optimize=True)
        results[photo['id']]={'source':photo['url'],'original_size':original,'new_size':im.size,'local_path':f'assets/upscaled/{filename}'}
        print(f"Enhanced {photo['id']}: {original} -> {im.size}")
    except Exception as exc:
        print(f"Skipped {photo['id']}: {exc}")
(out/'manifest.json').write_text(json.dumps(results,indent=2))
print(f'Done: {len(results)} files written to {out}')
