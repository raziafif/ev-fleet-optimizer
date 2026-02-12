/**
 * AI Insights Component
 * Displays predictive analytics and RL agent recommendations
 */

import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiService } from '../services/api';

interface DemandPrediction {
  hour: number;
  expectedDemand: number;
}

interface PricePrediction {
  hour: number;
  predictedPrice: number;
  confidence: number;
}

interface RLPerformance {
  totalStatesLearned: number;
  averageReward: number;
  explorationRate: number;
}

export const AIInsights: React.FC = () => {
  const [demandPredictions, setDemandPredictions] = useState<DemandPrediction[]>([]);
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([]);
  const [rlPerformance, setRLPerformance] = useState<RLPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      const [demand, prices, performance] = await Promise.all([
        fetch('/api/predictions/demand').then(r => r.json()),
        fetch('/api/predictions/prices').then(r => r.json()),
        fetch('/api/ml/rl-performance').then(r => r.json()),
      ]);

      if (demand.success) setDemandPredictions(demand.data);
      if (prices.success) setPricePredictions(prices.data);
      if (performance.success) setRLPerformance(performance.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading" style={{ minHeight: '200px' }}>
          Loading AI Insights...
        </div>
      </div>
    );
  }

  // Combine predictions for chart
  const chartData = demandPredictions.map((demand, index) => ({
    hour: `${demand.hour}h`,
    demand: (demand.expectedDemand * 100).toFixed(1),
    price: pricePredictions[index]?.predictedPrice || 0,
    confidence: (pricePredictions[index]?.confidence || 0) * 100,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Brain size={24} />
            AI Predictive Analytics
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Machine learning predictions for demand and pricing
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* RL Agent Performance */}
        {rlPerformance && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <Brain size={16} style={{ display: 'inline', marginRight: '4px' }} />
                RL States Learned
              </div>
              <div className="stat-value" style={{ color: '#fff' }}>{rlPerformance.totalStatesLearned}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <TrendingUp size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Avg Reward Score
              </div>
              <div className="stat-value" style={{ color: '#fff' }}>{rlPerformance.averageReward.toFixed(2)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <Zap size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Exploration Rate
              </div>
              <div className="stat-value" style={{ color: '#fff' }}>{(rlPerformance.explorationRate * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}

        {/* Predictions Chart */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} />
            24-Hour Predictions: Demand & Price Forecast
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="hour" 
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                label={{ value: 'Demand %', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                domain={[0, 0.25]}
                label={{ value: 'Price (€/kWh)', angle: 90, position: 'insideRight', fill: 'var(--color-text-muted)', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text)',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.875rem' }}
                iconType="line"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="demand" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 3 }}
                name="Predicted Demand (%)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 3 }}
                name="Predicted Price (€)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="confidence" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Confidence (%)"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Info Note */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-info)' }} />
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <strong>AI-Powered Forecasting:</strong> The system uses machine learning to predict charging demand and energy prices. 
              Higher confidence (dashed line) indicates more reliable predictions. Use these insights to plan ahead and optimize fleet operations.
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-warning)' }}>
              Peak Demand Forecast
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Highest demand expected between <strong>5-8 PM</strong>. Consider pre-charging vehicles to avoid congestion.
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-success)' }}>
              Best Charging Window
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Optimal charging time: <strong>10 PM - 6 AM</strong>. Up to 60% cost savings during off-peak hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
