# scripts/load_grammar_slides_to_db.py
import json, pyodbc, pathlib

BASE = pathlib.Path("backend/grammar")

conn = pyodbc.connect(
    "DRIVER={SQL Server};SERVER=localhost;DATABASE=EngLearningSystem;UID=sa;PWD=YourPassword"
)
cur = conn.cursor()

for unit_dir in sorted([p for p in BASE.iterdir() if p.is_dir()]):
    unit = unit_dir.name
    slides = sorted([str(p).replace("\\","/") for p in unit_dir.glob("*.png")])
    if not slides:
        continue

    slide_json = json.dumps({"slides": slides}, ensure_ascii=False)

    cur.execute("""
        UPDATE dbo.GrammarUnit
        SET slide = ?
        WHERE unit = ?
    """, (slide_json, unit))

conn.commit()
cur.close()
conn.close()
print("GrammarUnit.slide JSON 更新完成")
