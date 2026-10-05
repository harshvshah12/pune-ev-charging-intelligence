import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
from pypdf import PdfReader

pdf_path = "data/raw/BEE_Maharashtra_PCS.pdf"
reader = PdfReader(pdf_path)
print(f"Total pages in {pdf_path}: {len(reader.pages)}")

# Print text of first 3 pages
for i in range(min(3, len(reader.pages))):
    print(f"\n--- PAGE {i+1} ---")
    text = reader.pages[i].extract_text()
    lines = text.split("\n")
    for line in lines[:25]:
        print("  ", line)
    print(f"Total lines on page {i+1}: {len(lines)}")
