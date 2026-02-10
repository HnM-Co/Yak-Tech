import pandas as pd
import json
import os
import re
from datetime import datetime

# ==========================================
# 설정: 엑셀 파일 경로
# 다운로드 받은 파일을 scripts 폴더에 'data.xlsx'로 넣어주세요.
# ==========================================
INPUT_PATH = os.path.join("scripts", "data.xlsx")
OUTPUT_PATH = os.path.join("public", "drugs.json")

def clean_price(value):
    """가격 정보에서 숫자만 추출"""
    if pd.isna(value): return 0
    if isinstance(value, (int, float)): return int(value)
    # 콤마, 원, 공백 등 제거
    clean = re.sub(r'[^\d]', '', str(value))
    return int(clean) if clean else 0

def find_header_row(preview_df):
    """'제품명'이나 '약품명'이 들어있는 행을 헤더로 추정"""
    for idx, row in preview_df.iterrows():
        row_str = " ".join([str(x) for x in row.values])
        if "제품명" in row_str or "약품명" in row_str:
            return idx
    return 0

def run():
    print(f"[{datetime.now()}] Excel Import Script Started")
    
    if not os.path.exists(INPUT_PATH):
        print(f">> Error: Input file not found at '{INPUT_PATH}'")
        print(">> Please place the HIRA Excel file in the 'scripts' folder and name it 'data.xlsx'.")
        return

    print(">> Reading Excel file... (This may take a moment)")
    try:
        # 1. 헤더 위치 자동 탐지 (처음 20줄만 읽어서 확인)
        preview = pd.read_excel(INPUT_PATH, header=None, nrows=20)
        header_idx = find_header_row(preview)
        print(f">> Detected Header Row Index: {header_idx}")

        # 2. 실제 데이터 로드
        df = pd.read_excel(INPUT_PATH, header=header_idx)
    except Exception as e:
        print(f">> Failed to read Excel: {e}")
        print(">> Check if 'pandas' and 'openpyxl' are installed: pip install pandas openpyxl")
        return

    print(f">> Columns found: {list(df.columns[:5])} ...")
    
    # 3. 컬럼 매핑 (한글 컬럼명 -> 코드 변수명)
    col_map = {}
    for col in df.columns:
        c = str(col).strip().replace(" ", "") # 공백 제거 후 비교
        
        if "제품명" in c or "약품명" in c: col_map['name'] = col
        elif ("제품코드" in c or "약가코드" in c) and "주성분" not in c: col_map['id'] = col
        elif "상한금액" in c or "가격" in c: col_map['price'] = col
        elif "업체명" in c or "제약사" in c or "제조사" in c: col_map['manufacturer'] = col
        elif "주성분코드" in c: col_map['ingredientCode'] = col
        elif "주성분명" in c: col_map['ingredientName'] = col
        elif "분류" in c and "번호" not in c: col_map['category'] = col

    # 필수 컬럼 체크
    required = ['name', 'price']
    missing = [req for req in required if req not in col_map]
    if missing:
        print(f">> Error: Could not find columns for: {missing}")
        print(">> Please check the Excel file headers.")
        return

    drugs = []
    print(">> Processing rows...")
    
    # 4. 데이터 변환
    count = 0
    for _, row in df.iterrows():
        try:
            name = str(row[col_map['name']])
            if pd.isna(name) or name == 'nan': continue
            
            price = clean_price(row[col_map['price']])
            if price == 0: continue # 가격 없는 약은 제외
            
            # ID가 없으면 임시 ID 생성 (비추천하지만 에러 방지용)
            drug_id = str(row[col_map['id']]) if 'id' in col_map else f"TEMP-{count}"
            
            # 주성분코드 (가장 중요)
            if 'ingredientCode' in col_map:
                ing_code = str(row[col_map['ingredientCode']])
            else:
                # 주성분 코드가 없으면 비교 불가 -> 제외하거나 경고
                # 여기서는 일단 넣되, 'Unknown' 처리
                ing_code = "Unknown"

            ing_name = str(row[col_map['ingredientName']]) if 'ingredientName' in col_map else "성분명 미상"
            manufacturer = str(row[col_map['manufacturer']]) if 'manufacturer' in col_map else "알수없음"
            
            drugs.append({
                "id": drug_id,
                "name": name,
                "ingredientCode": ing_code,
                "ingredientName": ing_name,
                "price": price,
                "manufacturer": manufacturer,
                "category": "전문의약품", # 엑셀에 분류가 없으면 기본값
                "image": None
            })
            count += 1
            
        except Exception as e:
            continue

    # 5. JSON 저장
    result = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "totalCount": len(drugs),
        "drugs": drugs
    }
    
    # public 폴더가 없으면 생성
    if not os.path.exists('public'):
        os.makedirs('public')

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, separators=(',', ':'))
        
    print(f">> Success! Converted {len(drugs)} items.")
    print(f">> Saved to: {OUTPUT_PATH}")

if __name__ == "__main__":
    run()
