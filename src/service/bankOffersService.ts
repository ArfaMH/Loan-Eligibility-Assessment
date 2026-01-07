import { supabase, BankOffer } from './supabaseClient';

export interface RankedBankOffer {
  bank_name: string;
  bank_type: string;
  interest_rate: number;
  emi_in_INR: number;
  total_payable_in_INR: number;
  processing_fee: number;
  offer_url: string;
  account_opening_url: string;
  has_account_requirement: boolean;
  effective_annual_rate: number;
}

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;

  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

function calculateEffectiveAnnualRate(annualRate: number, processingFeePercent: number): number {
  return annualRate + (processingFeePercent * 0.1);
}

export async function fetchBankOffers(
  loanAmount: number,
  loanTerm: number
): Promise<RankedBankOffer[]> {
  const { data: offers, error } = await supabase
    .from('bank_offers')
    .select('*')
    .eq('is_active', true)
    .lte('loan_amount_min', loanAmount)
    .gte('loan_amount_max', loanAmount)
    .lte('loan_term_min', loanTerm)
    .gte('loan_term_max', loanTerm);

  if (error) {
    console.error('Failed to fetch bank offers:', error);
    return [];
  }

  if (!offers || offers.length === 0) {
    return [];
  }

  const rankedOffers: RankedBankOffer[] = offers.map((offer: BankOffer) => {
    const emi = calculateEMI(loanAmount, offer.interest_rate, loanTerm);
    const totalPayable = emi * loanTerm;
    const effectiveAnnualRate = calculateEffectiveAnnualRate(offer.interest_rate, offer.processing_fee);
    const processingFeeAmount = (loanAmount * offer.processing_fee) / 100;

    return {
      bank_name: offer.bank_name,
      bank_type: offer.bank_type,
      interest_rate: offer.interest_rate,
      emi_in_INR: emi,
      total_payable_in_INR: Math.round(totalPayable + processingFeeAmount),
      processing_fee: offer.processing_fee,
      offer_url: offer.offer_url,
      account_opening_url: offer.account_opening_url,
      has_account_requirement: true,
      effective_annual_rate: Math.round(effectiveAnnualRate * 100) / 100,
    };
  });

  rankedOffers.sort((a, b) => a.effective_annual_rate - b.effective_annual_rate);

  return rankedOffers;
}

export async function getAllBankOffers(): Promise<BankOffer[]> {
  const { data, error } = await supabase
    .from('bank_offers')
    .select('*')
    .eq('is_active', true)
    .order('interest_rate', { ascending: true });

  if (error) {
    console.error('Failed to fetch all bank offers:', error);
    return [];
  }

  return data || [];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
