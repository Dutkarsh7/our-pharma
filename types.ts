
export interface Medicine {
  originalName: string;
  activeSalt: string;
  strength: string;
  manufacturer: string;
  brandedPrice: number;
  genericPrice: number;
  genericBrandName: string;
  tabletCount: number;
  availability: 'In Stock' | 'Limited' | 'Out of Stock';
  deliveryTime: string;
  savingsPercentage: number;
  savingsAmount: number;
  monthlySavings: number;
  benefits: string[];
  rxRequired: boolean;
  isNarcotic: boolean;
  drugClass: string;
  uses: string;
  sideEffects: string;
  dosage: string;
  category?: string;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface PrescriptionAnalysis {
  medicines: Medicine[];
  totalBrandedCost: number;
  totalGenericCost: number;
  totalSavings: number;
  monthlySavingsTotal: number;
  patientAdvice: string;
  detectedCondition?: string;
}

export type ViewState = 'landing' | 'medicines' | 'experts' | 'consultation' | 'analysis' | 'admin' | 'error' | 'login' | 'forgot-password' | 'checkout' | 'founders' | 'about' | 'profile';

export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta';
export type Theme = 'light' | 'dark';

export interface User {
  email: string;
  name: string;
}

export interface AppState {
  view: ViewState;
  isAnalyzing: boolean;
  error: string | null;
  result: PrescriptionAnalysis | null;
  // Added imagePreview to resolve 'imagePreview' does not exist in type 'AppState' error in App.tsx
  imagePreview: string | null;
  pincode: string;
  user: User | null;
  cart: CartItem[];
  language: Language;
  theme: Theme;
}
