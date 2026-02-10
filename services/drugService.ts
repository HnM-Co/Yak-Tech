import { Drug } from '../types';
import { MOCK_DRUG_DB } from '../constants';

const API_KEY = 'a0f92aac1356efd3339d4c1a42571bc0420edd9fe0a5b9c4a4ee02386223cf60';

// 식별 정보 서비스 (이미지 로딩용 - 필요할 때만 호출)
const IMAGE_BASE_URL = 'https://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList01';
const PROXY_BASE = 'https://api.allorigins.win/raw?url=';

interface DrugDB {
  lastUpdated: string;
  totalCount: number;
  drugs: Drug[];
}

let STATIC_DB_CACHE: DrugDB | null = null;
const IMAGE_CACHE = new Map<string, string>();

/**
 * Github Actions가 생성한 전체 약가 데이터(drugs.json)를 로드합니다.
 */
export async function loadStaticDB(): Promise<DrugDB | null> {
  if (STATIC_DB_CACHE) return STATIC_DB_CACHE;
  
  try {
    const response = await fetch('/drugs.json');
    if (response.ok) {
      const data = await response.json();
      // 데이터 구조 확인
      if (data.drugs && Array.isArray(data.drugs)) {
        STATIC_DB_CACHE = data;
        console.log(`[DrugService] Loaded ${data.totalCount} drugs (Updated: ${data.lastUpdated})`);
        return data;
      }
    }
  } catch (e) {
    console.warn("Failed to load static DB:", e);
  }
  return null;
}

export async function fetchDrugImage(drugName: string): Promise<string | undefined> {
  if (IMAGE_CACHE.has(drugName)) return IMAGE_CACHE.get(drugName);

  try {
    const queryName = drugName.split('(')[0].trim();
    const targetUrl = `${IMAGE_BASE_URL}?serviceKey=${API_KEY}&item_name=${encodeURIComponent(queryName)}&pageNo=1&numOfRows=1&type=json`;
    const proxyUrl = `${PROXY_BASE}${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) return undefined;
    
    const data = await response.json();
    if (data.body && data.body.items && data.body.items.length > 0) {
      const imageUrl = data.body.items[0].item_image;
      if (imageUrl) {
        IMAGE_CACHE.set(drugName, imageUrl);
        return imageUrl;
      }
    }
  } catch (e) {
    // Ignore
  }
  return undefined;
}

/**
 * 고속 검색 함수 (메모리 기반)
 */
export async function searchDrugs(query: string): Promise<Drug[]> {
  if (query.length < 2) return [];

  const dbData = await loadStaticDB();
  let results: Drug[] = [];

  // 1. 실제 데이터 검색 (가장 빠름)
  if (dbData && dbData.drugs.length > 0) {
    const lowerQuery = query.toLowerCase();
    // 전체 리스트에서 필터링
    results = dbData.drugs.filter(d => 
      d.name.includes(query) || 
      (d.ingredientName && d.ingredientName.toLowerCase().includes(lowerQuery))
    );
  } else {
    // 2. 파일 로드 실패시 Mock 데이터 Fallback
    results = MOCK_DRUG_DB.filter(d => 
      d.name.includes(query) || d.ingredientName.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 상위 20개만 반환 (렌더링 성능 최적화)
  return results.slice(0, 20);
}

export async function getAlternatives(ingredientCode: string): Promise<Drug[]> {
   const dbData = await loadStaticDB();
   let alternatives: Drug[] = [];

   if (dbData && dbData.drugs.length > 0) {
     alternatives = dbData.drugs.filter(d => d.ingredientCode === ingredientCode);
   } else {
     alternatives = MOCK_DRUG_DB.filter(d => d.ingredientCode === ingredientCode);
   }

   alternatives.sort((a, b) => a.price - b.price);

   // 최저가 약품 이미지 로드 (필요시)
   if (alternatives.length > 0) {
     const cheapest = alternatives[0];
     if (!cheapest.image) {
       const image = await fetchDrugImage(cheapest.name);
       if (image) {
         alternatives[0] = { ...cheapest, image };
       }
     }
   }

   return alternatives;
}
