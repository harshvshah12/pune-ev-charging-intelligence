import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

reader = PdfReader("data/raw/BEE_EV_PCS_Data.pdf")
pages_to_check = [670, 671, 672]

for p in pages_to_check:
    print(f"\n=================== PAGE {p} ===================")
    text = reader.pages[p].extract_text()
    print(text[:1500])
