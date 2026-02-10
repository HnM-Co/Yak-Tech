import json
import requests
import os
import time
from datetime import datetime

# [건강보험심사평가원_약제급여목록정보]
# GitHub Secrets에서 'DATA_API_KEY'를 가져옵니다.
# 보안을 위해 소스코드에는 더 이상 API Key를 남기지 않습니다.
API_KEY = os.environ.get("DATA_API_KEY", "")

# 호환성을 위해 http 사용
BASE_URL = "http://apis.data.go.kr/1640000/HiraMedcinListInfoService/getHiraMedcinListInfo"

def fetch_real_price_data():
    all_drugs = []
    page = 1
    num_of_rows = 100 
    MAX_SAFETY_PAGES = 1000 
    
    print(f"[{datetime.now()}] Starting MONTHLY FULL data collection...", flush=True)

    # API Key 누락 확인
    if not API_KEY:
        print(">> CRITICAL ERROR: API Key is missing!", flush=True)
        print(">> Please set 'DATA_API_KEY' in GitHub Repository Settings > Secrets > Actions.", flush=True)
        # 키가 없으면 바로 종료
        return []
    
    # 키 마스킹 처리하여 로그 출력 (보안 확인용)
    masked_key = API_KEY[:4] + "****" + API_KEY[-4:] if len(API_KEY) > 8 else "****"
    print(f"Using API Key from Secrets: {masked_key}", flush=True)
    print(f"Target URL: {BASE_URL}", flush=True)

    while page <= MAX_SAFETY_PAGES:
        # requests 라이브러리가 params를 인코딩하므로, Decoding된 키를 넣는 것이 정석입니다.
        params = {
            "serviceKey": requests.utils.unquote(API_KEY), 
            "numOfRows": num_of_rows, 
            "pageNo": page,
            "type": "json" 
        }

        try:
            response = requests.get(BASE_URL, params=params, timeout=15)
            
            # 응답 상태 코드 확인
            if response.status_code != 200:
                print(f"!!! HTTP Error {response.status_code} on Page {page} !!!", flush=True)
                print(f"Response Body: {response.text[:500]}", flush=True)
                break

            # JSON 파싱 시도
            try:
                data = response.json()
                
                # 심평원 API는 JSON 내부에도 resultCode가 있을 수 있음
                header = data.get('header', {})
                if header and header.get('resultCode') not in ['00', '200']:
                    print(f">> API Logic Error: {header.get('resultMsg')}", flush=True)
                    break
                    
            except json.JSONDecodeError:
                # 여기가 바로 'JSON Decode Error'가 발생하는 지점입니다.
                print(f"!!! Critical Error on Page {page}: Response is NOT JSON !!!", flush=True)
                print("---------------- SERVER RESPONSE (RAW) ----------------", flush=True)
                # 서버가 보낸 내용을 그대로 출력합니다. 이 내용을 보면 원인을 알 수 있습니다.
                print(response.text[:1000], flush=True)
                print("-------------------------------------------------------", flush=True)
                
                print(">> Stop collection immediately to prevent infinite errors.", flush=True)
                break

            # 데이터 추출
            items = data.get('body', {}).get('items', [])
            
            if items is None:
                print(f"Page {page}: Items is null (End of Data or Error).", flush=True)
                break

            if not items:
                print(f"Page {page}: No more items found. Finishing collection.", flush=True)
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
                print(f"Page {page} done. Current Total: {len(all_drugs)}", flush=True)
            
            page += 1
            time.sleep(0.05) 
            
        except Exception as e:
            print(f"System Error on page {page}: {e}", flush=True)
            break
            
    if len(all_drugs) == 0:
        print(">> No drugs collected. Check the logs above for server errors.", flush=True)

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
