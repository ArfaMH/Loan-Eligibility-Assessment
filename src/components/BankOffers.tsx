import { ExternalLink, Building2, AlertCircle } from 'lucide-react';
import { RankedBankOffer, formatCurrency } from '../services/bankOffersService';

interface BankOffersProps {
  offers: RankedBankOffer[];
  isLoading: boolean;
}

export default function BankOffers({ offers, isLoading }: BankOffersProps) {
  const getBankTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      karnataka: 'Karnataka Bank',
      national: 'National Bank',
      regional: 'Regional Bank',
      cooperative: 'Cooperative Bank',
    };
    return labels[type] || type;
  };

  const getBankTypeBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      karnataka: 'bg-orange-100 text-orange-800',
      national: 'bg-blue-100 text-blue-800',
      regional: 'bg-green-100 text-green-800',
      cooperative: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Bank Offers</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Bank Offers</h2>
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bank offers available for the requested loan amount and term.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Bank Offers</h2>
        <p className="text-sm text-gray-600 mt-2">
          Sorted by effective annual rate (interest rate + processing fees)
        </p>
      </div>

      <div className="space-y-4">
        {offers.map((offer, index) => (
          <div
            key={index}
            className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
              index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center mb-3 md:mb-0">
                <Building2 className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{offer.bank_name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getBankTypeBadgeColor(offer.bank_type)}`}>
                    {getBankTypeLabel(offer.bank_type)}
                  </span>
                </div>
              </div>
              {index === 0 && (
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  BEST OFFER
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                <p className="text-lg font-bold text-gray-900">{offer.interest_rate.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Monthly EMI</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(offer.emi_in_INR)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Payable</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(offer.total_payable_in_INR)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Processing Fee</p>
                <p className="text-lg font-bold text-gray-900">{offer.processing_fee}%</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Account Required</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You must hold an account with {offer.bank_name} to apply for this loan.
                    {!offer.account_opening_url ? ' Please visit the bank to open an account.' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={offer.offer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <span>Apply Now</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
              {offer.account_opening_url && (
                <a
                  href={offer.account_opening_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center border border-gray-300"
                >
                  <span>Open Account</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Interest rates and offers are indicative and subject to change.
          Processing fees are calculated as a percentage of the loan amount. Total payable includes
          principal, interest, and processing fees. Final approval and interest rates depend on your
          credit profile and bank's assessment. Please verify current rates with the respective banks
          before applying.
        </p>
      </div>
    </div>
  );
}
