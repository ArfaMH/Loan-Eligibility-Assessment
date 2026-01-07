import { BarChart3, Activity } from 'lucide-react';
import { ModelMetrics as MetricsData } from '../services/supabaseClient';

interface ModelMetricsProps {
  metrics: MetricsData | null;
}

export default function ModelMetrics({ metrics }: ModelMetricsProps) {
  if (!metrics) {
    return null;
  }

  const metricsData = [
    { label: 'Accuracy', value: metrics.accuracy, color: 'bg-blue-500' },
    { label: 'Precision', value: metrics.precision, color: 'bg-green-500' },
    { label: 'Recall', value: metrics.recall, color: 'bg-yellow-500' },
    { label: 'F1 Score', value: metrics.f1_score, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Performance Dashboard</h2>
          <p className="text-sm text-gray-600">Version: {metrics.model_version}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metricsData.map((metric) => (
          <div key={metric.label} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value.toFixed(2)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm font-medium text-gray-700">Training Samples</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.training_samples.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-gray-700">Validation Samples</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.validation_samples.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Model Details:</strong> Ensemble model combining gradient boosting with neural network
          calibration. Features include income, credit history, loan amount, term, employment type,
          dependents, marital status, and engineered features (loan-to-income ratio, monthly burden,
          risk score). Trained with stratified cross-validation and class-imbalance handling.
        </p>
      </div>
    </div>
  );
}
