import { Medicine } from '../data/medicines';

export interface CartItem {
  medicine: Medicine;
  selectedType: 'brand' | 'generic';
  quantity: number;
  price: number;
}
