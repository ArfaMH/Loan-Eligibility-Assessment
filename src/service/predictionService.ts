import { supabase, Applicant, Prediction, ModelMetrics } from './supabaseClient';
import { getOrCreateModel, PredictionResult } from '../ml/modelTraining';

export async function submitApplication(applicantData: Omit<Applicant, 'id' | 'created_at'>): Promise<{
  applicant: Applicant;
  prediction: Prediction;
  predictionResult: PredictionResult;
}> {
  const { data: applicant, error: applicantError } = await supabase
    .from('applicants')
    .insert(applicantData)
    .select()
    .single();

  if (applicantError || !applicant) {
    throw new Error(`Failed to insert applicant: ${applicantError?.message}`);
  }

  const model = getOrCreateModel();
  const predictionResult = model.predict(applicantData);

  const predictionData: Omit<Prediction, 'id' | 'created_at'> = {
    applicant_id: applicant.id!,
    eligibility_status: predictionResult.eligibility_status,
    credit_score: predictionResult.credit_score,
    prediction_confidence: predictionResult.prediction_confidence,
    feature_attributions: predictionResult.feature_attributions,
    explanation: predictionResult.explanation,
    model_version: model.getVersion(),
  };

  const { data: prediction, error: predictionError } = await supabase
    .from('predictions')
    .insert(predictionData)
    .select()
    .single();

  if (predictionError || !prediction) {
    throw new Error(`Failed to insert prediction: ${predictionError?.message}`);
  }

  await supabase.from('audit_logs').insert({
    prediction_id: prediction.id,
    action: 'prediction_created',
    metadata: {
      applicant_id: applicant.id,
      eligibility_status: predictionResult.eligibility_status,
    },
  });

  return {
    applicant,
    prediction,
    predictionResult,
  };
}

export async function getModelMetrics(): Promise<ModelMetrics | null> {
  const { data, error } = await supabase
    .from('model_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch model metrics:', error);
    return null;
  }

  return data;
}

export async function initializeModelMetrics(): Promise<void> {
  const model = getOrCreateModel();
  const metrics = model.getMetrics();

  const { error } = await supabase.from('model_metrics').insert({
    model_version: model.getVersion(),
    accuracy: metrics.accuracy,
    precision: metrics.precision,
    recall: metrics.recall,
    f1_score: metrics.f1_score,
    training_samples: metrics.training_samples,
    validation_samples: metrics.validation_samples,
  });

  if (error) {
    console.error('Failed to initialize model metrics:', error);
  }
}
