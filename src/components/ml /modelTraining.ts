export interface TrainingData {
  income: number;
  credit_history: number;
  loan_amount: number;
  loan_term: number;
  employment_type: string;
  dependents: number;
  marital_status: string;
  approved: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_samples: number;
  validation_samples: number;
}

export interface PredictionResult {
  eligibility_status: 'Approved' | 'Rejected';
  credit_score: number;
  prediction_confidence: number;
  probability_approved: number;
  feature_attributions: Record<string, number>;
  explanation: string;
}

class LoanEligibilityModel {
  private weights: Map<string, number>;
  private encoders: Map<string, Map<string, number>>;
  private scaler: { mean: Map<string, number>; std: Map<string, number> };
  private metrics: ModelMetrics;
  private version: string = 'v1.0-ensemble';

  constructor() {
    this.weights = new Map();
    this.encoders = new Map();
    this.scaler = { mean: new Map(), std: new Map() };
    this.metrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1_score: 0,
      training_samples: 0,
      validation_samples: 0,
    };
    this.initializeEncoders();
  }

  private initializeEncoders(): void {
    this.encoders.set('employment_type', new Map([
      ['salaried', 0.8],
      ['self_employed', 0.5],
      ['business', 0.6],
    ]));

    this.encoders.set('marital_status', new Map([
      ['married', 0.7],
      ['single', 0.5],
      ['divorced', 0.4],
      ['widowed', 0.45],
    ]));
  }

  private engineerFeatures(data: Omit<TrainingData, 'approved'>): Record<string, number> {
    const features: Record<string, number> = {};

    features.income = data.income;
    features.credit_history = data.credit_history;
    features.loan_amount = data.loan_amount;
    features.loan_term = data.loan_term;
    features.dependents = data.dependents;

    features.employment_encoded = this.encoders.get('employment_type')?.get(data.employment_type) || 0.5;
    features.marital_encoded = this.encoders.get('marital_status')?.get(data.marital_status) || 0.5;

    features.loan_to_income_ratio = data.loan_amount / (data.income + 1);
    features.monthly_burden = (data.loan_amount * 0.01) / data.loan_term;
    features.income_per_dependent = data.income / (data.dependents + 1);
    features.credit_x_income = data.credit_history * data.income;
    features.risk_score = (data.loan_amount / (data.income + 1)) * (1 - data.credit_history) * (data.dependents + 1);

    return features;
  }

  private generateSyntheticData(samples: number): TrainingData[] {
    const data: TrainingData[] = [];
    const employmentTypes = ['salaried', 'self_employed', 'business'];
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];

    for (let i = 0; i < samples; i++) {
      const income = 200000 + Math.random() * 1800000;
      const credit_history = Math.random();
      const loan_amount = 100000 + Math.random() * 4900000;
      const loan_term = 12 + Math.floor(Math.random() * 348);
      const employment_type = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
      const dependents = Math.floor(Math.random() * 5);
      const marital_status = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];

      const lti_ratio = loan_amount / income;
      const employment_score = this.encoders.get('employment_type')?.get(employment_type) || 0.5;
      const risk = lti_ratio * (1 - credit_history) * (dependents * 0.1 + 1);

      const base_approval_prob =
        credit_history * 0.4 +
        (income / 2000000) * 0.25 +
        employment_score * 0.15 +
        (1 - Math.min(lti_ratio / 5, 1)) * 0.2;

      const approval_prob = Math.max(0, Math.min(1, base_approval_prob - risk * 0.3 + (Math.random() * 0.1 - 0.05)));
      const approved = approval_prob > 0.55 ? 1 : 0;

      data.push({
        income,
        credit_history,
        loan_amount,
        loan_term,
        employment_type,
        dependents,
        marital_status,
        approved,
      });
    }

    return data;
  }

  private trainEnsemble(trainingData: TrainingData[]): void {
    const features = trainingData.map(d => this.engineerFeatures(d));

    const featureNames = Object.keys(features[0]);
    featureNames.forEach(name => {
      const values = features.map(f => f[name]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance) || 1;

      this.scaler.mean.set(name, mean);
      this.scaler.std.set(name, std);
    });

    const normalizedFeatures = features.map(f => {
      const normalized: Record<string, number> = {};
      featureNames.forEach(name => {
        const mean = this.scaler.mean.get(name) || 0;
        const std = this.scaler.std.get(name) || 1;
        normalized[name] = (f[name] - mean) / std;
      });
      return normalized;
    });

    const learningRate = 0.01;
    const epochs = 100;

    featureNames.forEach(name => {
      this.weights.set(name, (Math.random() - 0.5) * 0.1);
    });

    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradients = new Map<string, number>();
      featureNames.forEach(name => gradients.set(name, 0));

      for (let i = 0; i < normalizedFeatures.length; i++) {
        const features = normalizedFeatures[i];
        const actual = trainingData[i].approved;

        let prediction = 0;
        featureNames.forEach(name => {
          prediction += features[name] * (this.weights.get(name) || 0);
        });

        const prob = 1 / (1 + Math.exp(-prediction));
        const error = prob - actual;

        featureNames.forEach(name => {
          const grad = error * features[name];
          gradients.set(name, (gradients.get(name) || 0) + grad);
        });
      }

      featureNames.forEach(name => {
        const weight = this.weights.get(name) || 0;
        const grad = (gradients.get(name) || 0) / normalizedFeatures.length;
        this.weights.set(name, weight - learningRate * grad);
      });
    }
  }

  private calculateMetrics(predictions: number[], actuals: number[]): ModelMetrics {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] >= 0.5 ? 1 : 0;
      const actual = actuals[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const accuracy = ((tp + tn) / predictions.length) * 100;
    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1_score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1_score,
      training_samples: Math.floor(predictions.length * 0.8),
      validation_samples: Math.ceil(predictions.length * 0.2),
    };
  }

  train(): ModelMetrics {
    const totalSamples = 5000;
    const syntheticData = this.generateSyntheticData(totalSamples);

    const splitIndex = Math.floor(totalSamples * 0.8);
    const trainingData = syntheticData.slice(0, splitIndex);
    const validationData = syntheticData.slice(splitIndex);

    this.trainEnsemble(trainingData);

    const validationPredictions = validationData.map(d => {
      const features = this.engineerFeatures(d);
      const featureNames = Object.keys(features);

      const normalized: Record<string, number> = {};
      featureNames.forEach(name => {
        const mean = this.scaler.mean.get(name) || 0;
        const std = this.scaler.std.get(name) || 1;
        normalized[name] = (features[name] - mean) / std;
      });

      let logit = 0;
      featureNames.forEach(name => {
        logit += normalized[name] * (this.weights.get(name) || 0);
      });

      return 1 / (1 + Math.exp(-logit));
    });

    const actuals = validationData.map(d => d.approved);
    this.metrics = this.calculateMetrics(validationPredictions, actuals);

    return this.metrics;
  }

  predict(data: Omit<TrainingData, 'approved'>): PredictionResult {
    const features = this.engineerFeatures(data);
    const featureNames = Object.keys(features);

    const normalized: Record<string, number> = {};
    featureNames.forEach(name => {
      const mean = this.scaler.mean.get(name) || 0;
      const std = this.scaler.std.get(name) || 1;
      normalized[name] = (features[name] - mean) / std;
    });

    let logit = 0;
    featureNames.forEach(name => {
      logit += normalized[name] * (this.weights.get(name) || 0);
    });

    const probability_approved = 1 / (1 + Math.exp(-logit));

    const feature_attributions: Record<string, number> = {};
    let totalContribution = 0;
    featureNames.forEach(name => {
      const contrib = Math.abs(normalized[name] * (this.weights.get(name) || 0));
      feature_attributions[name] = contrib;
      totalContribution += contrib;
    });

    Object.keys(feature_attributions).forEach(name => {
      feature_attributions[name] = (feature_attributions[name] / totalContribution) * 100;
    });

    const sortedAttributions = Object.entries(feature_attributions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((acc, [key, val]) => {
        acc[key] = Math.round(val * 100) / 100;
        return acc;
      }, {} as Record<string, number>);

    const eligibility_status: 'Approved' | 'Rejected' = probability_approved >= 0.5 ? 'Approved' : 'Rejected';

    const baseCreditScore = 300;
    const maxCreditScore = 850;
    const scoreRange = maxCreditScore - baseCreditScore;
    const credit_score = Math.round(baseCreditScore + probability_approved * scoreRange);

    const prediction_confidence = Math.round(
      (eligibility_status === 'Approved' ? probability_approved : 1 - probability_approved) * 100
    );

    const topFeatures = Object.keys(sortedAttributions).slice(0, 3);
    const explanation = this.generateExplanation(eligibility_status, topFeatures, features, data);

    return {
      eligibility_status,
      credit_score,
      prediction_confidence,
      probability_approved,
      feature_attributions: sortedAttributions,
      explanation,
    };
  }

  private generateExplanation(
    status: 'Approved' | 'Rejected',
    topFeatures: string[],
    features: Record<string, number>,
    data: Omit<TrainingData, 'approved'>
  ): string {
    const reasons: string[] = [];

    if (status === 'Approved') {
      if (data.credit_history >= 0.7) {
        reasons.push('strong credit history');
      }
      if (features.loan_to_income_ratio < 3) {
        reasons.push('healthy loan-to-income ratio');
      }
      if (data.employment_type === 'salaried') {
        reasons.push('stable employment');
      }
      if (data.income > 500000) {
        reasons.push('good income level');
      }
    } else {
      if (data.credit_history < 0.5) {
        reasons.push('weak credit history');
      }
      if (features.loan_to_income_ratio > 5) {
        reasons.push('high loan-to-income ratio');
      }
      if (features.risk_score > 1000000) {
        reasons.push('elevated risk score');
      }
      if (data.dependents > 3) {
        reasons.push('higher number of dependents');
      }
    }

    return `Application ${status.toLowerCase()} based on ${reasons.join(', ')}.`;
  }

  getMetrics(): ModelMetrics {
    return this.metrics;
  }

  getVersion(): string {
    return this.version;
  }
}

let globalModel: LoanEligibilityModel | null = null;

export function getOrCreateModel(): LoanEligibilityModel {
  if (!globalModel) {
    globalModel = new LoanEligibilityModel();
    globalModel.train();
  }
  return globalModel;
}

export function trainNewModel(): ModelMetrics {
  globalModel = new LoanEligibilityModel();
  return globalModel.train();
}
