export interface Drug {
  id: string;
  name: string;
  ingredientCode: string; // The key to link same drugs
  ingredientName: string;
  price: number; // Price per unit in KRW
  manufacturer: string;
  category: string;
  image?: string;
}

export interface DrugComparison {
  original: Drug;
  cheapest: Drug;
  alternatives: Drug[];
  savingsPerPill: number;
}