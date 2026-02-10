import { Drug } from './types';

// Mock Data mimicking the structure of Korean Health Insurance Review & Assessment Service
export const MOCK_DRUG_DB: Drug[] = [
  // 1. Celecoxib (Celebrex) - Very common in Orthopedics
  { id: '1', name: '쎄레브렉스캡슐200mg', ingredientCode: '636701ATB', ingredientName: 'Celecoxib', price: 523, manufacturer: '한국비아트리스', category: 'NSAID' },
  { id: '2', name: '콕시비캡슐200mg', ingredientCode: '636701ATB', ingredientName: 'Celecoxib', price: 350, manufacturer: '한미약품', category: 'NSAID' },
  { id: '3', name: '셀레브이캡슐200mg', ingredientCode: '636701ATB', ingredientName: 'Celecoxib', price: 298, manufacturer: '종근당', category: 'NSAID' },
  { id: '4', name: '쏘롱캡슐200mg', ingredientCode: '636701ATB', ingredientName: 'Celecoxib', price: 285, manufacturer: '대웅제약', category: 'NSAID' },

  // 2. Aceclofenac (Airtal)
  { id: '5', name: '에어탈정', ingredientCode: '101301ATB', ingredientName: 'Aceclofenac', price: 184, manufacturer: '대웅제약', category: 'NSAID' },
  { id: '6', name: '아세페낙정', ingredientCode: '101301ATB', ingredientName: 'Aceclofenac', price: 110, manufacturer: '부광약품', category: 'NSAID' },
  { id: '7', name: '에이서정', ingredientCode: '101301ATB', ingredientName: 'Aceclofenac', price: 98, manufacturer: '경동제약', category: 'NSAID' },

  // 3. Acetaminophen ER (Tylenol 8hr)
  { id: '8', name: '타이레놀8시간이알서방정', ingredientCode: '115201ATB', ingredientName: 'Acetaminophen', price: 510, manufacturer: '한국얀센', category: 'Analgesic' },
  { id: '9', name: '써스펜8시간이알서방정', ingredientCode: '115201ATB', ingredientName: 'Acetaminophen', price: 250, manufacturer: '한미약품', category: 'Analgesic' },
  { id: '10', name: '타이리콜8시간이알서방정', ingredientCode: '115201ATB', ingredientName: 'Acetaminophen', price: 198, manufacturer: '하나제약', category: 'Analgesic' },

  // 4. Limaprost (Opalmon) - Spinal Stenosis
  { id: '11', name: '오팔몬정', ingredientCode: '185301ATB', ingredientName: 'Limaprost', price: 350, manufacturer: '동아에스티', category: 'Circulation' },
  { id: '12', name: '리마펠정', ingredientCode: '185301ATB', ingredientName: 'Limaprost', price: 210, manufacturer: '종근당', category: 'Circulation' },
  { id: '13', name: '오파스트정', ingredientCode: '185301ATB', ingredientName: 'Limaprost', price: 185, manufacturer: '한미약품', category: 'Circulation' },
  
  // 5. Rebamipide (Mucosta) - Gastric protector
  { id: '14', name: '무코스타정100mg', ingredientCode: '222901ATB', ingredientName: 'Rebamipide', price: 106, manufacturer: '한국오츠카', category: 'Gastric' },
  { id: '15', name: '레바넥스정', ingredientCode: '222901ATB', ingredientName: 'Rebamipide', price: 75, manufacturer: '대웅제약', category: 'Gastric' },
  { id: '16', name: '무코원정', ingredientCode: '222901ATB', ingredientName: 'Rebamipide', price: 68, manufacturer: '동구바이오', category: 'Gastric' },
];

export const PILLS_PER_DAY_DEFAULT = 2; // Assumption for chronic prescription calculations
