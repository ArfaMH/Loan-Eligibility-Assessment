import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import ApplicationForm, { ApplicationData } from './components/ApplicationForm';
import PredictionResult from './components/PredictionResult';
import BankOffers from './components/BankOffers';
import ModelMetrics from './components/ModelMetrics';
import { submitApplication, getModelMetrics, initializeModelMetrics } from './services/predictionService';
import { fetchBankOffers } from './services/bankOffersService';
import { PredictionResult as PredictionData } from './ml/modelTraining';
import { RankedBankOffer } from './services/bankOffersService';
import { ModelMetrics as MetricsData } from './services/supabaseClient';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [bankOffers, setBankOffers] = useState<RankedBankOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    let existingMetrics = await getModelMetrics();

    if (!existingMetrics) {
      await initializeModelMetrics();
      existingMetrics = await getModelMetrics();
    }

    setMetrics(existingMetrics);
  };

  const handleSubmit = async (data: ApplicationData) => {
    setIsLoading(true);
    setPrediction(null);
    setBankOffers([]);

    try {
      const result = await submitApplication(data);
      setPrediction(result.predictionResult);

      setLoadingOffers(true);
      const offers = await fetchBankOffers(data.loan_amount, data.loan_term);
      setBankOffers(offers);
      setLoadingOffers(false);
    } catch (error) {
      console.error('Application submission failed:', error);
      alert('Failed to process application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Loan Eligibility Assessment System
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced ML-powered loan eligibility assessment with real-time credit scoring,
            feature explainability, and live bank offers from Karnataka and national banks
          </p>
        </header>

        <div className="max-w-7xl mx-auto space-y-8">
          <ApplicationForm onSubmit={handleSubmit} isLoading={isLoading} />

          {metrics && <ModelMetrics metrics={metrics} />}

          {prediction && (
            <>
              <PredictionResult prediction={prediction} />
              <BankOffers offers={bankOffers} isLoading={loadingOffers} />
            </>
          )}
        </div>

        <footer className="text-center mt-12 text-gray-600 text-sm">
          <p>
            Powered by ensemble ML models with 98%+ target accuracy. All predictions include
            SHAP-based feature attributions for transparency and regulatory compliance.
          </p>
        </footer>
      </div>
    </div>
  );
}
