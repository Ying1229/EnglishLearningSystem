import csv
import json
import os

# 來源資料夾
BASE_DIR = "project/data/quiz"

def convert_csv_to_json(input_path, output_path):
    # """把 CSV 檔轉換成 JSON 檔"""
    with open(input_path, "r", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        data = [row for row in reader]

    with open(output_path, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    print(f"✅ 已轉換: {input_path} → {output_path}")


def batch_convert():
    # """批次轉換 quiz/grammar + quiz/vocab"""
    for quiz_type in ["grammar", "vocab"]:
        folder = os.path.join(BASE_DIR, quiz_type)
        for filename in os.listdir(folder):
            if filename.endswith(".csv"):
                input_path = os.path.join(folder, filename)
                output_path = input_path.replace(".csv", ".json")
                convert_csv_to_json(input_path, output_path)

if __name__ == "__main__":
    batch_convert()
