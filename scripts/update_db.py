import json
import requests
import os
import time
import sys
from datetime import datetime

# 로그 즉시 출력을 위해 버퍼링 해제
sys.stdout.reconfigure(line_buffering=True)

# [건강보험심사평가원_약제급여목록정보]
# GitHub Secrets에서 'DATA_API_KEY'를 가져옵니다.
API_KEY = os.environ.get("DATA_API_KEY", "")

# 호환성을 위해 http 사용
BASE_URL = "http://apis.data.go.kr/1640000/HiraMedcinListInfoService/getHiraMedcinListInfo"

def fetch_real_price_data():
    all_drugs = []
    page = 1
    num_of_rows = 100 
    MAX_SAFETY_PAGES = 1000 
    
    print(f"[{datetime.now()}] Script Started. Initializing...", flush=True)

    # API Key 누락 확인
    if not API_KEY:
        print(">> CRITICAL ERROR: API Key is missing!", flush=True)
        print(">> Please set 'DATA_API_KEY' in GitHub Repository Settings > Secrets > Actions.", flush=True)
        return []
    
    # 키 마스킹 처리하여 로그 출력
    masked_key = API_KEY[:4] + "****" + API_KEY[-4:] if len(API_KEY) > 8 else "****"
    print(f"Using API Key: {masked_key}", flush=True)
    print(f"Target URL: {BASE_URL}", flush=True)
    print("-------------------------------------------------------", flush=True)

    # 연결 테스트 (1페이지만 가볍게 찔러보기)
    print(">> Testing connection to data.go.kr...", flush=True)
    try:
        test_params = {
            "serviceKey": requests.utils.unquote(API_KEY), 
            "numOfRows": 1, 
            "pageNo": 1, 
            "type": "json"
        }
        test_res = requests.get(BASE_URL, params=test_params, timeout=5)
        if test_res.status_code == 200:
            print(">> Connection Successful! Starting full collection.", flush=True)
        else:
            print(f">> Connection Warning: Status {test_res.status_code}", flush=True)
    except Exception as e:
        print(f">> Connection Failed (Possible IP Block or Timeout): {e}", flush=True)
        return []

    while page <= MAX_SAFETY_PAGES:
        params = {
            "serviceKey": requests.utils.unquote(API_KEY), 
            "numOfRows": num_of_rows, 
            "pageNo": page,
            "type": "json" 
        }

        try:
            # 타임아웃 5초로 단축 (해외 접속 차단 시 빨리 실패하도록)
            response = requests.get(BASE_URL, params=params, timeout=5)
            
            if response.status_code != 200:
                print(f"!!! HTTP Error {response.status_code} on Page {page} !!!", flush=True)
                break

            try:
                data = response.json()
                header = data.get('header', {})
                if header and header.get('resultCode') not in ['00', '200']:
                    print(f">> API Logic Error: {header.get('resultMsg')}", flush=True)
                    break
                    
            except json.JSONDecodeError:
                print(f"!!! Critical Error on Page {page}: Response is NOT JSON !!!", flush=True)
                print("---------------- SERVER RESPONSE (RAW) ----------------", flush=True)
                print(response.text[:500], flush=True) # 너무 길면 짤라서 출력
                print("-------------------------------------------------------", flush=True)
                print(">> Stop collection immediately.", flush=True)
                break

            items = data.get('body', {}).get('items', [])
            
            if not items:
                print(f"Page {page}: No more items found (Empty List). Finishing.", flush=True)
                break
            
            for item in items:
                name = item.get("itemNm")
                price_str = item.get("maxAmt")
                code = item.get("medcinCd")
                
                if not name or not price_str or not code:
                    continue

                try:
                    price = int(str(price_str).replace(',', ''))
                except ValueError:
                    continue

                drug = {
                    "id": code,
                    "name": name,
                    "ingredientCode": item.get("mainIngrCd") or code[:4],
                    "ingredientName": item.get("mainIngrNm") or "복합/기타성분",
                    "price": price,
                    "manufacturer": item.get("entrpsNm") or "알수없음",
                    "category": item.get("divCd") or "전문의약품",
                    "image": None
                }
                all_drugs.append(drug)
            
            if page % 10 == 0:
                print(f"Page {page} done. Total: {len(all_drugs)}", flush=True)
            
            page += 1
            # 과도한 요청 방지용 딜레이
            time.sleep(0.05) 
            
        except requests.exceptions.Timeout:
            print(f"!!! Timeout on Page {page} (Server slow or IP blocked) !!!", flush=True)
            break
        except Exception as e:
            print(f"System Error on page {page}: {e}", flush=True)
            break
            
    if len(all_drugs) == 0:
        print(">> No drugs collected. Check the logs above.", flush=True)

    return all_drugs

def save_to_json(data):
    if not data:
        print("No data collected. Skip saving.", flush=True)
        return

    if not os.path.exists('public'):
        os.makedirs('public')
        
    file_path = 'public/drugs.json'
    
    final_output = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "totalCount": len(data),
        "drugs": data
    }

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    
    print(f"Successfully saved {len(data)} drugs to {file_path}", flush=True)

if __name__ == "__main__":
    drugs = fetch_real_price_data()
    save_to_json(drugs)
