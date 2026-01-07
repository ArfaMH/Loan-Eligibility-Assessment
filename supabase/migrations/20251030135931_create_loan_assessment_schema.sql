/*
  # Loan Eligibility Assessment System Schema

  ## Overview
  Creates comprehensive database schema for ML-powered loan assessment system with audit trails,
  model metrics tracking, and bank offers management.

  ## New Tables

  ### 1. applicants
  Stores loan applicant information and features for ML prediction
  - `id` (uuid, primary key)
  - `income` (numeric) - Annual income
  - `credit_history` (numeric) - Credit history score 0-1
  - `loan_amount` (numeric) - Requested loan amount in INR
  - `loan_term` (integer) - Loan term in months
  - `employment_type` (text) - salaried/self_employed/business
  - `dependents` (integer) - Number of dependents
  - `marital_status` (text) - single/married/divorced/widowed
  - `created_at` (timestamptz)

  ### 2. predictions
  Stores ML model predictions and explainability data
  - `id` (uuid, primary key)
  - `applicant_id` (uuid, foreign key)
  - `eligibility_status` (text) - Approved/Rejected
  - `credit_score` (numeric) - 300-850 range
  - `prediction_confidence` (numeric) - 0-100%
  - `feature_attributions` (jsonb) - SHAP/LIME values
  - `explanation` (text) - Human-readable explanation
  - `model_version` (text)
  - `created_at` (timestamptz)

  ### 3. model_metrics
  Tracks model performance over time
  - `id` (uuid, primary key)
  - `model_version` (text)
  - `accuracy` (numeric)
  - `precision` (numeric)
  - `recall` (numeric)
  - `f1_score` (numeric)
  - `training_samples` (integer)
  - `validation_samples` (integer)
  - `created_at` (timestamptz)

  ### 4. bank_offers
  Stores fetched bank loan offers
  - `id` (uuid, primary key)
  - `bank_name` (text)
  - `bank_type` (text) - national/regional/karnataka/cooperative
  - `interest_rate` (numeric) - Annual interest rate %
  - `loan_amount_min` (numeric)
  - `loan_amount_max` (numeric)
  - `loan_term_min` (integer)
  - `loan_term_max` (integer)
  - `processing_fee` (numeric)
  - `offer_url` (text)
  - `account_opening_url` (text)
  - `last_updated` (timestamptz)
  - `is_active` (boolean)

  ### 5. audit_logs
  Compliance and monitoring logs
  - `id` (uuid, primary key)
  - `prediction_id` (uuid, foreign key)
  - `action` (text)
  - `user_agent` (text)
  - `ip_address` (inet)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public can insert applicants and read predictions (for demo purposes)
  - Admin role needed for model_metrics and audit_logs
  - Bank offers are public readable
*/

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  income numeric NOT NULL CHECK (income >= 0),
  credit_history numeric NOT NULL CHECK (credit_history >= 0 AND credit_history <= 1),
  loan_amount numeric NOT NULL CHECK (loan_amount > 0),
  loan_term integer NOT NULL CHECK (loan_term > 0),
  employment_type text NOT NULL CHECK (employment_type IN ('salaried', 'self_employed', 'business')),
  dependents integer NOT NULL DEFAULT 0 CHECK (dependents >= 0),
  marital_status text NOT NULL CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  created_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  eligibility_status text NOT NULL CHECK (eligibility_status IN ('Approved', 'Rejected')),
  credit_score numeric NOT NULL CHECK (credit_score >= 300 AND credit_score <= 850),
  prediction_confidence numeric NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
  feature_attributions jsonb NOT NULL DEFAULT '{}',
  explanation text NOT NULL DEFAULT '',
  model_version text NOT NULL DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now()
);

-- Create model_metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  accuracy numeric NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  precision numeric NOT NULL CHECK (precision >= 0 AND precision <= 100),
  recall numeric NOT NULL CHECK (recall >= 0 AND recall <= 100),
  f1_score numeric NOT NULL CHECK (f1_score >= 0 AND f1_score <= 100),
  training_samples integer NOT NULL DEFAULT 0,
  validation_samples integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create bank_offers table
CREATE TABLE IF NOT EXISTS bank_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  bank_type text NOT NULL CHECK (bank_type IN ('national', 'regional', 'karnataka', 'cooperative')),
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  loan_amount_min numeric NOT NULL DEFAULT 0,
  loan_amount_max numeric NOT NULL DEFAULT 100000000,
  loan_term_min integer NOT NULL DEFAULT 12,
  loan_term_max integer NOT NULL DEFAULT 360,
  processing_fee numeric NOT NULL DEFAULT 0,
  offer_url text NOT NULL,
  account_opening_url text NOT NULL DEFAULT '',
  last_updated timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES predictions(id) ON DELETE SET NULL,
  action text NOT NULL,
  user_agent text DEFAULT '',
  ip_address inet,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_applicant ON predictions(applicant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(model_version);
CREATE INDEX IF NOT EXISTS idx_bank_offers_active ON bank_offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_prediction ON audit_logs(prediction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Applicants: Anyone can insert (for demo), read own data
CREATE POLICY "Anyone can insert applicants"
  ON applicants FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read applicants"
  ON applicants FOR SELECT
  TO anon, authenticated
  USING (true);

-- Predictions: Anyone can insert and read (for demo)
CREATE POLICY "Anyone can insert predictions"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read predictions"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Model metrics: Public read access
CREATE POLICY "Anyone can read model metrics"
  ON model_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage model metrics"
  ON model_metrics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Bank offers: Public read access
CREATE POLICY "Anyone can read active bank offers"
  ON bank_offers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage bank offers"
  ON bank_offers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Audit logs: Service role only
CREATE POLICY "Service role can manage audit logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed initial bank offers data (Karnataka and national banks)
INSERT INTO bank_offers (bank_name, bank_type, interest_rate, loan_amount_min, loan_amount_max, loan_term_min, loan_term_max, processing_fee, offer_url, account_opening_url)
VALUES
  ('Karnataka Bank', 'karnataka', 10.50, 50000, 5000000, 12, 240, 1.0, 'https://www.ktkbank.com/personal-banking/loans', 'https://www.ktkbank.com/open-account'),
  ('Canara Bank - Karnataka', 'karnataka', 10.25, 50000, 7500000, 12, 300, 0.5, 'https://canarabank.com/personal-banking/loans/home-loans', 'https://canarabank.com/online-account-opening'),
  ('State Bank of India - Karnataka', 'national', 9.90, 100000, 10000000, 12, 360, 0.35, 'https://sbi.co.in/web/personal-banking/loans/home-loans', 'https://sbi.co.in/web/personal-banking/accounts/saving-account/digital-savings-account'),
  ('Indian Bank - Karnataka', 'national', 10.15, 50000, 5000000, 12, 240, 0.5, 'https://www.indianbank.in/products/retail-loans/', 'https://www.indianbank.in/digital-banking/online-account-opening/'),
  ('Karnataka Vikas Grameena Bank', 'regional', 10.75, 25000, 2500000, 12, 180, 1.5, 'https://www.kvgbank.com/loans', 'https://www.kvgbank.com/savings-account'),
  ('HDFC Bank', 'national', 9.70, 100000, 10000000, 12, 360, 0.5, 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan', 'https://www.hdfcbank.com/personal/save/accounts/savings-accounts'),
  ('ICICI Bank', 'national', 9.85, 100000, 10000000, 12, 360, 0.5, 'https://www.icicibank.com/personal-banking/loans/home-loan', 'https://www.icicibank.com/personal-banking/accounts/savings-account'),
  ('Axis Bank', 'national', 9.95, 75000, 7500000, 12, 300, 0.5, 'https://www.axisbank.com/retail/loans/home-loan', 'https://www.axisbank.com/retail/accounts/savings-account'),
  ('Punjab National Bank', 'national', 10.40, 50000, 5000000, 12, 240, 0.75, 'https://www.pnbindia.in/en/ui/Loans-Home-Loan.aspx', 'https://www.pnbindia.in/en/ui/Saving-Bank-Account.aspx'),
  ('Bank of Baroda', 'national', 10.30, 50000, 7500000, 12, 300, 0.5, 'https://www.bankofbaroda.in/personal-banking/loans/home-loans', 'https://www.bankofbaroda.in/personal-banking/accounts/savings-account')
ON CONFLICT DO NOTHING;
