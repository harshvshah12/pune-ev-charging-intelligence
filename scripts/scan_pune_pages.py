import os
import sys
import re
import json
import pandas as pd
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "data/raw/BEE_EV_PCS_Data.pdf"
reader = PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Total pages: {total_pages}")

# Find pages containing Maharashtra and Pune
pune_pages = []
for idx in range(total_pages):
    text = reader.pages[idx].extract_text()
    if "Maharashtra" in text or "MAHARASHTRA" in text:
        if "Pune" in text or "PUNE" in text or "Pimpri" in text:
            pune_pages.append(idx)

print(f"Found {len(pune_pages)} pages mentioning Maharashtra and Pune/Pimpri!")
print("Page numbers (0-indexed):", pune_pages[:20], "..." if len(pune_pages) > 20 else "")
