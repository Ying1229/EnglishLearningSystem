import requests
import time
import random
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 統一請求標頭（假裝是 Chrome 瀏覽器）
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/114.0.0.0 Safari/537.36"
}

def get_session():
    """
    建立一個 requests Session，包含重試機制
    """
    session = requests.Session()
    retry = Retry(
        total=3,                # 最多重試 3 次
        backoff_factor=1,       # 每次重試間隔 1, 2, 4 秒
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def polite_get(url):
    """
    用統一 UA 發送請求，並且隨機延遲
    """
    session = get_session()
    response = session.get(url, headers=HEADERS)
    # 隨機延遲 1~3 秒，避免被封鎖
    time.sleep(random.uniform(1, 3))
    return response

def save_json(path, data):
    """
    儲存資料到 JSON 檔案
    path: 檔案路徑 (str)
    data: 要儲存的 Python 資料 (dict / list)
    """
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


