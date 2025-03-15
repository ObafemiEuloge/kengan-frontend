export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  type_display?: string;
  name: string;
  details: any;
  is_default: boolean;
  created_at: string;
}

export type PaymentMethodType = 'card' | 'mobile_money' | 'bank_transfer' | 'crypto'; 