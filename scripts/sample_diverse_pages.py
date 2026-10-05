import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

reader = PdfReader("data/raw/BEE_EV_PCS_Data.pdf")
print("Total pages:", len(reader.pages))

# Sample 5 different pages that mention Maharashtra and Pune
pune_pages = []
for idx in range(len(reader.pages)):
    t = reader.pages[idx].extract_text()
    if ("maharashtra" in t.lower()) and ("pune" in t.lower() or "pimpri" in t.lower()):
        pune_pages.append(idx)

print(f"Total Pune pages: {len(pune_pages)}")
print(f"Sample pages across distribution: {pune_pages[0]}, {pune_pages[len(pune_pages)//4]}, {pune_pages[len(pune_pages)//2]}, {pune_pages[3*len(pune_pages)//4]}, {pune_pages[-1]}")

for p in [pune_pages[0], pune_pages[len(pune_pages)//4], pune_pages[len(pune_pages)//2], pune_pages[3*len(pune_pages)//4], pune_pages[-1]]:
    print(f"\n=================== PAGE {p} ===================")
    t = reader.pages[p].extract_text()
    lines = [l.strip() for l in t.split("\n") if l.strip()]
    for l in lines[:15]:
        print("  ", l)
