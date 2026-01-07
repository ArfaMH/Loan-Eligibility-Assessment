import { CheckCircle, XCircle, TrendingUp, Info } from 'lucide-react';
import { PredictionResult as PredictionData } from '../ml/modelTraining';

interface PredictionResultProps {
  prediction: PredictionData;
}

export default function PredictionResult({ prediction }: PredictionResultProps) {
  const isApproved = prediction.eligibility_status === 'Approved';

  const getCreditScoreColor = (score: number): string => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCreditScoreLabel = (score: number): string => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Result</h2>
        <div className={`flex items-center ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
          {isApproved ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>
      </div>

      <div className={`p-6 rounded-lg ${isApproved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Eligibility Status</p>
          <p className={`text-3xl font-bold ${isApproved ? 'text-green-700' : 'text-red-700'}`}>
            {prediction.eligibility_status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm font-medium text-gray-600">Credit Score</p>
          </div>
          <p className={`text-3xl font-bold ${getCreditScoreColor(prediction.credit_score)}`}>
            {prediction.credit_score}
          </p>
          <p className="text-sm text-gray-500 mt-1">{getCreditScoreLabel(prediction.credit_score)}</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-gray-600 mr-2" />
            <p className="text-sm font-medium text-gray-600">Prediction Confidence</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{prediction.prediction_confidence}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Model probability: {(prediction.probability_approved * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Explanation</h3>
        <p className="text-gray-700">{prediction.explanation}</p>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Feature Contributions</h3>
        <div className="space-y-3">
          {Object.entries(prediction.feature_attributions).map(([feature, value]) => (
            <div key={feature}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-900">{value.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
