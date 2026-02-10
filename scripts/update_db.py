import json
import requests
import os
import time
from datetime import datetime

# [건강보험심사평가원_약제급여목록정보] API 설정
API_KEY = "a0f92aac1356efd3339d4c1a42571bc0420edd9fe0a5b9c4a4ee02386223cf60"
BASE_URL = "http://apis.data.go.kr/1640000/HiraMedcinListInfoService/getHiraMedcinListInfo"

def fetch_real_price_data():
    """
    약제급여목록 API에서 '모든' 데이터를 수집합니다. (페이지 제한 없음)
    """
    all_drugs = []
    page = 1
    # 한 번에 많이 가져오기 위해 row 수를 늘림 (API 허용 범위 내)
    num_of_rows = 100 
    
    # 안전장치: 최대 페이지 수 제한
    MAX_SAFETY_PAGES = 1000 
    
    print(f"[{datetime.now()}] Starting MONTHLY FULL data collection...")

    while page <= MAX_SAFETY_PAGES:
        params = {
            "serviceKey": requests.utils.unquote(API_KEY),
            "numOfRows": num_of_rows, 
            "pageNo": page,
            "type": "json" 
        }
        
        # 공공데이터포털 API 호출 시 User-Agent 헤더 추가 권장
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        try:
            response = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
            
            try:
                data = response.json()
            except json.JSONDecodeError:
                print(f"Page {page}: JSON Decode Error. Retrying once...")
                time.sleep(2)
                continue

            items = data.get('body', {}).get('items', [])
            
            # 더 이상 데이터가 없으면 종료
            if not items:
                print(f"Page {page}: No more items found. Finishing collection.")
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
                print(f"Page {page} done. Current Total: {len(all_drugs)}")
            
            page += 1
            # 서버 부하 방지 및 차단 회피를 위한 미세 지연
            time.sleep(0.05) 
            
        except Exception as e:
            print(f"Critical Error on page {page}: {e}")
            break
            
    if page > MAX_SAFETY_PAGES:
        print("Warning: Reached MAX_SAFETY_PAGES limit.")

    return all_drugs

def save_to_json(data):
    # 디렉토리 존재 확인 및 생성
    if not os.path.exists('public'):
        os.makedirs('public', exist_ok=True)
        
    file_path = 'public/drugs.json'
    
    # 메타데이터 추가: 언제 업데이트 되었는지 기록
    final_output = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "totalCount": len(data),
        "drugs": data
    }

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    
    print(f"Successfully saved {len(data)} drugs to {file_path}")

if __name__ == "__main__":
    drugs = fetch_real_price_data()
    if drugs and len(drugs) > 0:
        save_to_json(drugs)
    else:
        print("No data fetched. Skipping save.")
