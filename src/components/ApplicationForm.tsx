import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface ApplicationFormProps {
  onSubmit: (data: ApplicationData) => Promise<void>;
  isLoading: boolean;
}

export interface ApplicationData {
  income: number;
  credit_history: number;
  loan_amount: number;
  loan_term: number;
  employment_type: string;
  dependents: number;
  marital_status: string;
}

export default function ApplicationForm({ onSubmit, isLoading }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationData>({
    income: 500000,
    credit_history: 0.8,
    loan_amount: 1000000,
    loan_term: 240,
    employment_type: 'salaried',
    dependents: 1,
    marital_status: 'married',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof ApplicationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900">Loan Eligibility Assessment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
            Annual Income (₹)
          </label>
          <input
            type="number"
            id="income"
            value={formData.income}
            onChange={(e) => handleChange('income', Number(e.target.value))}
            min="0"
            step="10000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="credit_history" className="block text-sm font-medium text-gray-700 mb-2">
            Credit History Score (0.0 - 1.0)
          </label>
          <input
            type="number"
            id="credit_history"
            value={formData.credit_history}
            onChange={(e) => handleChange('credit_history', Number(e.target.value))}
            min="0"
            max="1"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            id="loan_amount"
            value={formData.loan_amount}
            onChange={(e) => handleChange('loan_amount', Number(e.target.value))}
            min="1"
            step="10000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="loan_term" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term (months)
          </label>
          <input
            type="number"
            id="loan_term"
            value={formData.loan_term}
            onChange={(e) => handleChange('loan_term', Number(e.target.value))}
            min="12"
            max="360"
            step="12"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type
          </label>
          <select
            id="employment_type"
            value={formData.employment_type}
            onChange={(e) => handleChange('employment_type', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self Employed</option>
            <option value="business">Business</option>
          </select>
        </div>

        <div>
          <label htmlFor="dependents" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dependents
          </label>
          <input
            type="number"
            id="dependents"
            value={formData.dependents}
            onChange={(e) => handleChange('dependents', Number(e.target.value))}
            min="0"
            max="10"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            id="marital_status"
            value={formData.marital_status}
            onChange={(e) => handleChange('marital_status', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Processing Application...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
}
