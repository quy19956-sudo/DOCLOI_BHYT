from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent / "assets"
page = root / "index.html"
html = page.read_text()
pattern = r'(?<=type="application/octet-stream">)[A-Za-z0-9+/=]+'
match = re.search(pattern, html)
payload = base64.b64decode(match.group())
library, separator, _ = payload.partition(b'\nconst norm=')
if not separator:
    raise ValueError("Không tìm thấy điểm bắt đầu bộ đọc Excel.")
handler = payload[payload.rindex(b'\nonmessage=e=>'):]
updated = library + b'\n' + (root / 'reader.js').read_bytes() + handler
page.write_text(html[:match.start()] + base64.b64encode(updated).decode() + html[match.end():])
