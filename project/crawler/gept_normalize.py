# crawler/gept_normalize.py
# 清洗/切單位、欄位正規化 → JSON/CSV
import json, csv, pathlib

# IN = pathlib.Path("project/data/raw/intermediate_S4.json")   # 你爬下來的
# OUT = pathlib.Path("project/data/processed/intermediate_S4.csv")   # 輸出 CSV
# OUT.parent.mkdir(parents=True, exist_ok=True)

# with IN.open(encoding="utf-8") as f:
#     rows = json.load(f)              # 期望結構: [{"word":"abandon","pos":"v.","meaning":"放棄","level":"中級"}, ...]

# with OUT.open("w", newline="", encoding="utf-8") as f:
#     writer = csv.DictWriter(f, fieldnames=["word","pos","meaning","level"])
#     writer.writeheader()
#     writer.writerows(rows)

# print(f"Saved -> {OUT}")

# ________________________
IN = pathlib.Path("data/raw/slide_A22.json")   # 你爬下來的
OUT = pathlib.Path("data/processed/slide_A22.csv")   # 輸出 CSV
OUT.parent.mkdir(parents=True, exist_ok=True)

with IN.open(encoding="utf-8") as f:
    rows = json.load(f)              # 期望結構: [{"word":"abandon","pos":"v.","meaning":"放棄","level":"中級"}, ...]

with OUT.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["slide","unit","level_id"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Saved -> {OUT}")
