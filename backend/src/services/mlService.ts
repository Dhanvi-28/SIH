import axios from 'axios';
import { config } from '../config';

export interface MLPredictionInput {
  centerId: string;
  farmersAhead: number;
  queueSize: number;
  totalQuantityAhead: number;
  farmerQuantity: number;
  averageProcessingMinutes: number;
  activeCounters: number;
  centerCapacity: number;
  expectedArrivals: number;
  hourOfDay: number;
}

export interface MLPredictionOutput {
  predictedMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  confidence: number;
  factors: Array<{ name: string; impact: 'high' | 'medium' | 'low' }>;
}

export async function predictWaitingTime(input: MLPredictionInput): Promise<MLPredictionOutput> {
  try {
    // Try calling Python FastAPI ML service
    const response = await axios.post(`${config.mlServiceUrl}/predict`, input, { timeout: 1500 });
    if (response.status === 200 && response.data.predictedMinutes !== undefined) {
      return response.data;
    }
  } catch (err) {
    // Graceful fallback to internal Scikit-learn style regression engine
  }

  // Internal Fallback Regression Calculation
  const activeCounters = Math.max(1, input.activeCounters || 4);
  const avgSpeed = input.averageProcessingMinutes || 7.5;
  
  // Base wait time = (Farmers ahead * avgSpeed) / activeCounters
  const baseWait = (input.farmersAhead * avgSpeed) / activeCounters;

  // Produce volume adjustment factor: + 1 minute per 15 tons ahead
  const volumeFactor = (input.totalQuantityAhead / 15) * 0.4;

  // Peak hour adjustment (10 AM to 1 PM busiest)
  let peakFactor = 1.0;
  if (input.hourOfDay >= 10 && input.hourOfDay <= 13) {
    peakFactor = 1.15;
  }

  const rawWait = (baseWait + volumeFactor) * peakFactor;
  const predictedMinutes = Math.max(5, Math.round(rawWait));
  const minMinutes = Math.max(2, Math.round(predictedMinutes * 0.82));
  const maxMinutes = Math.round(predictedMinutes * 1.25);
  const confidence = Math.min(0.95, Math.max(0.70, 0.90 - input.farmersAhead * 0.01));

  const factors: Array<{ name: string; impact: 'high' | 'medium' | 'low' }> = [
    { name: `Farmers Ahead (${input.farmersAhead})`, impact: input.farmersAhead > 5 ? 'high' : 'medium' },
    { name: `Active Counters (${activeCounters})`, impact: activeCounters < 4 ? 'high' : 'medium' },
    { name: `Processing Speed (${avgSpeed} min/farmer)`, impact: 'medium' },
    { name: `Center Workload (${Math.round((input.expectedArrivals / input.centerCapacity) * 100)}%)`, impact: 'high' },
    { name: `Historical Hourly Trend (${input.hourOfDay}:00)`, impact: 'low' },
  ];

  return {
    predictedMinutes,
    minMinutes,
    maxMinutes,
    confidence: Math.round(confidence * 100) / 100,
    factors,
  };
}
