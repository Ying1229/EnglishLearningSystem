import requests
from bs4 import BeautifulSoup
import urllib3
import json
import re
import time
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

url = "https://www.lttc.ntu.edu.tw/tw/vocabulary_detail/979c0cb0eee4643265da62e7eb62abaf?filter=eyJwYWdlIjo0fQ=="
head = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36'
}

res = requests.get(url, headers=head, verify=False)
soup = BeautifulSoup(res.text, "html.parser")

# # word_find = soup.find_all('div', class_='word-group')
# # pos_find = soup.find_all('div', class_='collapse-head mb')

vocabulary_find = soup.find_all('div', class_='collapse-head mb',)
data_list =[]

#爬取單頁單字
for vocab in vocabulary_find:
    data = {}

    # 1️⃣ 找到 word-group
    word_group = vocab.find('div', class_='word-group')
    word_p = word_group.find('p', class_='list-row__text') if word_group else None
    data['word'] = word_p.text.strip() if word_p else ''

    # 2️⃣ 找到 pos_div（word_group 的下一個兄弟）
    pos_div = word_group.find_next_sibling('div') if word_group else None
    pos_p = pos_div.find('p', class_='list-row__text') if pos_div else None
    data['pos'] = pos_p.text.strip() if pos_p else ''

    # 3️⃣ 找到 meaning_div（pos_div 的下一個兄弟）
    meaning = vocab.find('p', class_='list-row__text chinese-text')
    meaning = meaning.text if meaning else ''
    data['meaning'] = meaning

    level = vocab.find('div', class_=re.compile(r'level level-[e, i] cn'))
    level = level.text if level else''
    data['level'] = level

    # print (data)
# 印出結果

#############爬取多頁單字 ex:中級F 13頁###################
# head = {
#     'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
# }

# base = "https://www.lttc.ntu.edu.tw/tw/vocabulary_detail/{}/?filter={}"
# id_path = "0c65b1749bf3121ee3d5529e71e1bcd4"
# data_list =[]
# for page_num, filter_val in [(1, "eyJwYWdlIjoxfQ=="),
#                              (2, "eyJwYWdlIjoyfQ=="),
#                              (3, "eyJwYWdlIjozfQ=="),
#                              (4, "eyJwYWdlIjo0fQ=="),
#                              (5, "eyJwYWdlIjo1fQ=="),
#                              (6, "eyJwYWdlIjo2fQ=="),
#                              (7, "eyJwYWdlIjo3fQ=="),
#                              (8, "eyJwYWdlIjo4fQ=="),
#                              (9, "eyJwYWdlIjo5fQ=="),
#                              (10, "eyJwYWdlIjoxMH0=="),
#                              (11, "eyJwYWdlIjoxMX0=="),
#                              (12, "eyJwYWdlIjoxMn0=="),
#                              (13, "eyJwYWdlIjoxM30==")]:  # 依此類推 需找網頁規律
#     url = base.format(id_path, filter_val)
#     resp = requests.get(url, headers=head, verify=False)
#     soup = BeautifulSoup(resp.text, "html.parser")
#     vocabulary_find = soup.find_all('div', class_='collapse-head mb',)
    
#     # 在這裡寫你爬取單字的邏輯
#     for vocab in vocabulary_find:
#         data = {}

#     # 1️⃣ 找到 word-group
#         word_group = vocab.find('div', class_='word-group')
#         word_p = word_group.find('p', class_='list-row__text') if word_group else None
#         data['word'] = word_p.text.strip() if word_p else ''

#     # 2️⃣ 找到 pos_div（word_group 的下一個兄弟）
#         pos_div = word_group.find_next_sibling('div') if word_group else None
#         pos_p = pos_div.find('p', class_='list-row__text') if pos_div else None
#         data['pos'] = pos_p.text.strip() if pos_p else ''

#     # 3️⃣ 找到 meaning_div（pos_div 的下一個兄弟）
#         meaning = vocab.find('p', class_='list-row__text chinese-text')
#         meaning = meaning.text if meaning else ''
#         data['meaning'] = meaning

#         level = vocab.find('div', class_=re.compile(r'level level-[e, i] cn'))
#         level = level.text if level else''
#         data['level'] = level

#         # print (data)
#         time.sleep(0.3)
#         print(f"第 {page_num} 頁，網址：{url}")
#         data_list.append(data)

# -------------------原寫法 無法找到pos--------------------
# for a in vocabulary_find:
#     data = {}

#     word = a.find('p', class_='list-row__text')
#     word = word.text if word else ''
#     data['word'] = word
    
#     meaning = a.find('p', class_='list-row__text chinese-text')
#     meaning = meaning.text if meaning else ''
#     data['meaning'] = meaning

#     pos = a.find_parents('p', class_='list-row__text')
#     pos = pos.text if pos else''
#     data['pos'] = pos
    
#     print(data)
#----------------------------------------------------------*/
# ＃＃＃＃＃將爬出的資訊製成json檔＃＃＃＃＃＃
    data_list.append(data)

with open("intermediate_F_all.json","w", encoding='utf-8') as file:
    json.dump(data_list, file, ensure_ascii=False, indent=4)