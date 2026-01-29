
export type ProjectSystem = 'biodeck' | 'syndeck';

export interface Product {
  id: string;
  name: string;
  sqftPerUnit: number;
  unitLabel: 'Box' | 'Bag';
  color: string;
  description: string;
}

export interface CalculationResult {
  productId: string;
  units: number;
  exactValue: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
