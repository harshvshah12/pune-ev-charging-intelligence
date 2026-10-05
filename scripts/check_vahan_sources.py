import os
import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect Parivahan analytics public dashboard endpoints or public reports
vahan_urls = [
    "https://analytics.parivahan.gov.in/analytics/vahanpublicreport",
    "https://api.data.gov.in/resource/4ea819e6-0be8-4cc3-bb74-a74070a8d672?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json",
    "https://raw.githubusercontent.com/datameet/vahan/master/data/rto_monthly_ev.csv",
    "https://raw.githubusercontent.com/opendatapune/data/master/MH%20RTO%20New%20vehicle%20registrations%202000-2017.pdf"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
}

for url in vahan_urls:
    try:
        r = requests.head(url, headers=headers, timeout=8)
        print(f"[{r.status_code}] {url[:80]}...")
    except Exception as e:
        print(f"[ERR] {url[:80]} -> {e}")
