
export type ProjectSystem = 'biodeck' | 'syndeck' | 'arkansas' | 'egs';

export interface Product {
  id: string;
  name: string;
  sqftPerUnit: number;
  unitLabel: 'Box' | 'Bag' | 'Unit' | 'Bucket' | 'Roll';
  color: string;
  description: string;
}

export interface CalculationResult {
  productId: string;
  units: number;
  exactValue: number;
}
