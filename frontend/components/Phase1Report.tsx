import React from 'react';
import { Phase1Data } from '../types.ts';
import { PackageSearch, TrendingUp, Truck, AlertTriangle, DollarSign, Activity, Clock, ShieldAlert, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: Phase1Data;
}

export const Phase1Report: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'COGS', value: data.supplierEconomics.cogs, color: '#ef4444' },
    { name: 'Retail', value: data.supplierEconomics.retailPrice, color: '#3b82f6' },
    { name: 'Profit', value: data.supplierEconomics.retailPrice - data.supplierEconomics.cogs, color: '#10b981' }
  ];

  const isViable = data.viabilityScore >= 7;

  const getMarketStatusColor = (status: string) => {
    switch (status) {
      case 'Golden Opportunity': return 'text-os-accent border-os-accent bg-os-accent/10';
      case 'Requires Differentiation': return 'text-os-warning border-os-warning bg-os-warning/10';
      case 'Niche Play': return 'text-os-info border-os-info bg-os-info/10';
      case 'Avoid': return 'text-os-danger border-os-danger bg-os-danger/10';
      default: return 'text-os-text border-os-border bg-os-bg';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-os-border pb-4">
        <PackageSearch className="w-6 h-6 text-os-accent" />
        <h2 className="text-2xl font-bold text-os-text tracking-tight">PHASE 1: THE PRODUCT VERDICT</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Identity Card */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 col-span-1 md:col-span-2">
          <h3 className="text-xs font-mono text-os-muted uppercase tracking-wider mb-2">Product Identity</h3>
          <p className="text-lg font-semibold text-os-text mb-1">{data.productIdentity}</p>
          <div className="inline-block bg-os-border text-os-text text-xs px-2 py-1 rounded mt-2">
            Niche: {data.niche}
          </div>
        </div>

        {/* Viability Score */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isViable ? 'bg-os-accent' : 'bg-os-warning'}`}></div>
          <h3 className="text-xs font-mono text-os-muted uppercase tracking-wider mb-2 w-full text-left">Viability Score</h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold ${isViable ? 'text-os-accent' : 'text-os-warning'}`}>
              {data.viabilityScore}
            </span>
            <span className="text-os-muted text-xl">/10</span>
          </div>
          <p className="text-xs text-os-muted mt-2 text-center">{data.viabilityText}</p>
        </div>
      </div>

      {/* Trend Analysis Section */}
      <div className="bg-os-panel border border-os-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-os-accent" />
          <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Trend & Momentum Analysis</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center">
            <span className="text-xs text-os-muted uppercase mb-1">Momentum Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-os-text">{data.trendAnalysis.momentumScore}</span>
              <span className="text-os-muted text-sm">/10</span>
            </div>
          </div>
          
          <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center">
            <span className="text-xs text-os-muted uppercase mb-1">Trend Type</span>
            <span className="text-sm font-semibold text-os-info">{data.trendAnalysis.trendType}</span>
          </div>

          <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center">
            <span className="text-xs text-os-muted uppercase mb-1">Peak Timing</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-os-muted" />
              <span className="text-sm font-semibold text-os-text">{data.trendAnalysis.peakTiming}</span>
            </div>
          </div>

          <div className={`p-4 rounded border flex flex-col justify-center ${getMarketStatusColor(data.trendAnalysis.marketStatus)}`}>
            <span className="text-xs uppercase mb-1 opacity-80">Market Status</span>
            <span className="text-sm font-bold">{data.trendAnalysis.marketStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-os-bg p-4 rounded border border-os-border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-os-muted" />
              <span className="text-xs text-os-muted uppercase">Competition Density</span>
            </div>
            <p className="text-sm text-os-text">{data.trendAnalysis.competitionDensity}</p>
          </div>
          <div className="bg-os-bg p-4 rounded border border-os-border">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-os-muted" />
              <span className="text-xs text-os-muted uppercase">Sustainability Analysis</span>
            </div>
            <p className="text-sm text-os-text">{data.trendAnalysis.sustainabilityAnalysis}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economics */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Unit Economics</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-os-bg p-3 rounded border border-os-border">
              <div className="text-xs text-os-muted mb-1">COGS</div>
              <div className="text-lg font-mono text-os-danger">${data.supplierEconomics.cogs.toFixed(2)}</div>
            </div>
            <div className="bg-os-bg p-3 rounded border border-os-border">
              <div className="text-xs text-os-muted mb-1">Retail</div>
              <div className="text-lg font-mono text-os-info">${data.supplierEconomics.retailPrice.toFixed(2)}</div>
            </div>
            <div className="bg-os-bg p-3 rounded border border-os-border">
              <div className="text-xs text-os-muted mb-1">Margin</div>
              <div className="text-lg font-mono text-os-accent">{data.supplierEconomics.netMargin}%</div>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: '#27272a', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#e4e4e7' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-os-muted mt-4 border-t border-os-border pt-4">
            {data.supplierEconomics.breakdownText}
          </p>
        </div>

        {/* Logistics */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Logistics & Risk</h3>
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border">
              <span className="text-sm text-os-muted">Primary Supplier</span>
              <span className="font-mono text-os-text font-semibold">{data.logistics.primarySupplier}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border">
              <span className="text-sm text-os-muted">Shipping Window</span>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-os-info" />
                <span className="font-mono text-os-text">{data.logistics.shippingWindow}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border">
              <span className="text-sm text-os-muted">Return/Defect Risk</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-os-warning" />
                <span className="font-mono text-os-text">{data.logistics.returnRisk}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-os-bg p-4 rounded border border-os-border border-l-4 border-l-os-accent">
            <p className="text-sm text-os-muted leading-relaxed">
              {data.logistics.assessmentText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
