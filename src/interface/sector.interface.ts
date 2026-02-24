export interface Sector {
  id: string;
  title: string;
  color: string;
  isActive: boolean;
  preparationWeekday: number;
  maxTotalKg: number | null;
  maxItems: number | null;
  allowAllProducts: boolean;
  allowedProductSlugs: string[];
  createdAt?: string;
  updatedAt?: string;
}
