import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Applicant {
  id?: string;
  income: number;
  credit_history: number;
  loan_amount: number;
  loan_term: number;
  employment_type: string;
  dependents: number;
  marital_status: string;
  created_at?: string;
}

export interface Prediction {
  id?: string;
  applicant_id: string;
  eligibility_status: string;
  credit_score: number;
  prediction_confidence: number;
  feature_attributions: Record<string, number>;
  explanation: string;
  model_version: string;
  created_at?: string;
}

export interface ModelMetrics {
  id?: string;
  model_version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_samples: number;
  validation_samples: number;
  created_at?: string;
}

export interface BankOffer {
  id: string;
  bank_name: string;
  bank_type: string;
  interest_rate: number;
  loan_amount_min: number;
  loan_amount_max: number;
  loan_term_min: number;
  loan_term_max: number;
  processing_fee: number;
  offer_url: string;
  account_opening_url: string;
  last_updated: string;
  is_active: boolean;
}
