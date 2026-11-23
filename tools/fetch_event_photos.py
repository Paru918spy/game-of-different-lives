#!/usr/bin/env python3
"""Download the freely licensed Wikimedia Commons event photos listed in tools/event_candidates.json,
save them to img/events/ and write js/events.js (with author, license and source for the credit lines).
Run from the project folder:  python3 -m pip install pillow && python3 tools/fetch_event_photos.py
Commons throttles busy networks (HTTP 429); the script waits and retries, and can be re-run (it skips files it already has).
Check the pictures afterwards; to change a choice edit "pick" (index into "cands") for that entry, or delete the entry."""
import io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "GameOfDifferentLives/1.0 (student diversity education project)"
C = json.load(open(os.path.join(ROOT, "tools/event_candidates.json")))
os.makedirs(os.path.join(ROOT, "img/events"), exist_ok=True)
ev = {}
for key, v in C.items():
    c = v["cands"][min(v["pick"], len(v["cands"]) - 1)]; cid, idx = key.split(":")
    fn = f"img/events/{cid}_{idx}.webp"; path = os.path.join(ROOT, fn)
    if not os.path.exists(path):
        url = "https://commons.wikimedia.org/w/thumb.php?f=" + urllib.parse.quote(c["title"][5:]) + "&w=900"
        for attempt in range(8):
            try:
                d = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
                im = Image.open(io.BytesIO(d)).convert("RGB"); im.thumbnail((900, 900)); im.save(path, "WEBP", quality=74, method=6); print("ok", key, flush=True); break
            except Exception as e:
                print("retry", key, str(e)[:50], flush=True); time.sleep(30 * (attempt + 1))
        else:
            continue
        time.sleep(3)
    ev.setdefault(cid, {})[int(idx)] = dict(file=fn, alt=v["q"], author=c["author"] or "Unknown author", license=c["lic"], licenseUrl=c["licUrl"], source=c["page"], title=c["title"])
open(os.path.join(ROOT, "js/events.js"), "w").write("/* Event pictures from Wikimedia Commons (freely licensed). Keys: life id, then space index. */\nwindow.GOL = window.GOL || { characters: [] };\nGOL.events = " + json.dumps(ev, indent=1, ensure_ascii=False) + ";\n")
print(sum(len(x) for x in ev.values()), "event photos written")
