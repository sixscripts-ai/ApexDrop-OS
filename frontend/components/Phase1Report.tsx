import React, { useState } from 'react';
import { Phase1Data } from '../types.ts';
import { PackageSearch, TrendingUp, Truck, AlertTriangle, DollarSign, Activity, Clock, ShieldAlert, Image as ImageIcon, Calculator, Factory, Globe, Link as LinkIcon, ExternalLink, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Props {
  data: Phase1Data;
  imageUrl?: string;
}

export const Phase1Report: React.FC<Props> = ({ data, imageUrl }) => {
  const [cogs, setCogs] = useState(data.supplierEconomics.cogs);
  const [retail, setRetail] = useState(data.supplierEconomics.retailPrice);
  const [cac, setCac] = useState(Math.round(data.supplierEconomics.retailPrice * 0.25));

  const profit = retail - cogs - cac;
  const marginPercent = Math.round((profit / retail) * 100) || 0;
  
  // Calculate Break-Even ROAS
  const grossMargin = retail - cogs;
  const beRoas = grossMargin > 0 ? (retail / grossMargin).toFixed(2) : 'N/A';

  const chartData = [
    { name: 'COGS', value: cogs, color: '#ef4444' },
    { name: 'CAC', value: cac, color: '#f59e0b' },
    { name: 'Profit', value: profit > 0 ? profit : 0, color: '#10b981' }
  ];

  const radarData = [
    { subject: 'Demand', A: data.trendAnalysis.radarScores?.demand || 5, fullMark: 10 },
    { subject: 'Competition', A: data.trendAnalysis.radarScores?.competition || 5, fullMark: 10 },
    { subject: 'Margin', A: data.trendAnalysis.radarScores?.margin || 5, fullMark: 10 },
    { subject: 'Trend', A: data.trendAnalysis.radarScores?.trend || 5, fullMark: 10 },
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

  const getSourcingMethodColor = (method: string) => {
    if (method.includes('POD')) return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
    if (method.includes('Standard')) return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
  };

  return (
    <div className="space-y-6 animate-fade-in print-panel">
      <div className="flex items-center gap-3 border-b border-os-border pb-4">
        <PackageSearch className="w-6 h-6 text-os-accent print-text" />
        <h2 className="text-2xl font-bold text-os-text tracking-tight print-text">PHASE 1: THE PRODUCT VERDICT</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-os-panel border border-os-border rounded-lg p-5 col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-6 print-panel">
          {imageUrl ? (
            <div className="w-full sm:w-1/3 aspect-square rounded-lg overflow-hidden border border-os-border shrink-0">
              <img src={imageUrl} alt={data.productIdentity} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full sm:w-1/3 aspect-square rounded-lg border border-os-border border-dashed flex flex-col items-center justify-center text-os-muted shrink-0 bg-os-bg">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-mono">No Image Generated</span>
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h3 className="text-xs font-mono text-os-muted uppercase tracking-wider mb-2 print-muted">Product Identity</h3>
            <p className="text-xl font-semibold text-os-text mb-2 print-text">{data.productIdentity}</p>
            <div className="inline-block bg-os-border text-os-text text-xs px-3 py-1.5 rounded w-fit print-panel print-text">
              Niche: {data.niche}
            </div>
          </div>
        </div>

        <div className="bg-os-panel border border-os-border rounded-lg p-5 flex flex-col items-center justify-center relative overflow-hidden print-panel">
          <div className={`absolute top-0 left-0 w-1 h-full ${isViable ? 'bg-os-accent' : 'bg-os-warning'} no-print`}></div>
          <h3 className="text-xs font-mono text-os-muted uppercase tracking-wider mb-2 w-full text-left print-muted">Viability Score</h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold ${isViable ? 'text-os-accent' : 'text-os-warning'} print-text`}>
              {data.viabilityScore}
            </span>
            <span className="text-os-muted text-xl print-muted">/10</span>
          </div>
          <p className="text-xs text-os-muted mt-2 text-center print-muted">{data.viabilityText}</p>
        </div>
      </div>

      <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-os-accent print-text" />
          <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Trend & Momentum Analysis</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center print-panel">
              <span className="text-xs text-os-muted uppercase mb-1 print-muted">Momentum Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-os-text print-text">{data.trendAnalysis.momentumScore}</span>
                <span className="text-os-muted text-sm print-muted">/10</span>
              </div>
            </div>
            
            <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center print-panel">
              <span className="text-xs text-os-muted uppercase mb-1 print-muted">Trend Type</span>
              <span className="text-sm font-semibold text-os-info print-text">{data.trendAnalysis.trendType}</span>
            </div>

            <div className="bg-os-bg p-4 rounded border border-os-border flex flex-col justify-center print-panel">
              <span className="text-xs text-os-muted uppercase mb-1 print-muted">Peak Timing</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-os-muted print-muted" />
                <span className="text-sm font-semibold text-os-text print-text">{data.trendAnalysis.peakTiming}</span>
              </div>
            </div>

            <div className={`p-4 rounded border flex flex-col justify-center print-panel ${getMarketStatusColor(data.trendAnalysis.marketStatus)}`}>
              <span className="text-xs uppercase mb-1 opacity-80 print-muted">Market Status</span>
              <span className="text-sm font-bold print-text">{data.trendAnalysis.marketStatus}</span>
            </div>

            <div className="bg-os-bg p-4 rounded border border-os-border sm:col-span-2 print-panel">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-os-muted print-muted" />
                <span className="text-xs text-os-muted uppercase print-muted">Sustainability Analysis</span>
              </div>
              <p className="text-sm text-os-text print-text">{data.trendAnalysis.sustainabilityAnalysis}</p>
            </div>
          </div>

          <div className="bg-os-bg rounded border border-os-border flex flex-col items-center justify-center p-2 print-panel">
            <span className="text-xs text-os-muted uppercase mb-2 print-muted">Market Matrix</span>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
        <div className="flex items-center gap-2 mb-4">
          <Factory className="w-5 h-5 text-os-accent print-text" />
          <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Automated Supplier Matchmaking</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Optimal Sourcing Method</h4>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${getSourcingMethodColor(data.sourcingStrategy.method)} print-panel print-text`}>
                <Globe className="w-4 h-4" />
                <span className="text-sm font-bold">{data.sourcingStrategy.method}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs text-os-muted uppercase mb-3 print-muted">Top Supplier Matches</h4>
              <div className="space-y-3">
                {data.sourcingStrategy.recommendedSuppliers.map((supplier, idx) => (
                  <div key={idx} className="bg-os-bg border border-os-border p-3 rounded flex flex-col gap-2 print-panel">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-os-text print-text">{supplier.name}</span>
                      <a href={supplier.url} target="_blank" rel="noreferrer" className="text-os-info hover:underline flex items-center gap-1 text-xs no-print">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-os-muted print-muted">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-os-warning fill-os-warning" /> {supplier.rating}</span>
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {supplier.shippingTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <h4 className="text-xs text-os-muted uppercase mb-1 print-muted">Strategic Reasoning</h4>
              <p className="text-sm text-os-text print-text">{data.sourcingStrategy.reasoning}</p>
            </div>
            
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <h4 className="text-xs text-os-muted uppercase mb-1 flex items-center gap-1 print-muted">
                <LinkIcon className="w-3 h-3" /> Integration Steps
              </h4>
              <p className="text-sm text-os-text print-text">{data.sourcingStrategy.integrationSteps}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-inside">
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-os-accent print-text" />
              <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Interactive Economics</h3>
            </div>
            <span className="text-xs bg-os-accent/20 text-os-accent px-2 py-1 rounded no-print">Live Calc</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <div className="text-xs text-os-muted mb-1 print-muted">COGS</div>
              <div className="text-lg font-mono text-os-danger print-text">${cogs.toFixed(2)}</div>
            </div>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <div className="text-xs text-os-muted mb-1 print-muted">Retail</div>
              <div className="text-lg font-mono text-os-info print-text">${retail.toFixed(2)}</div>
            </div>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <div className="text-xs text-os-muted mb-1 print-muted">Net Margin</div>
              <div className={`text-lg font-mono print-text ${marginPercent >= 30 ? 'text-os-accent' : 'text-os-warning'}`}>
                {marginPercent}%
              </div>
            </div>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <div className="text-xs text-os-muted mb-1 print-muted">BE ROAS</div>
              <div className="text-lg font-mono text-os-text print-text">{beRoas}x</div>
            </div>
          </div>

          <div className="space-y-4 mb-6 no-print">
            <div>
              <div className="flex justify-between text-xs text-os-muted mb-1">
                <span>Retail Price ($)</span>
                <span>${retail}</span>
              </div>
              <input type="range" min={cogs} max={cogs * 10} step="1" value={retail} onChange={(e) => setRetail(Number(e.target.value))} className="w-full accent-os-info" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-os-muted mb-1">
                <span>Est. CAC ($)</span>
                <span>${cac}</span>
              </div>
              <input type="range" min="0" max={retail} step="1" value={cac} onChange={(e) => setCac(Number(e.target.value))} className="w-full accent-os-warning" />
            </div>
          </div>

          <div className="h-40 w-full">
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
        </div>

        <div className="bg-os-panel border border-os-border rounded-lg p-5 flex flex-col print-panel">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Logistics & Risk</h3>
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border print-panel">
              <span className="text-sm text-os-muted print-muted">Primary Supplier</span>
              <span className="font-mono text-os-text font-semibold print-text">{data.logistics.primarySupplier}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border print-panel">
              <span className="text-sm text-os-muted print-muted">Shipping Window</span>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-os-info print-text" />
                <span className="font-mono text-os-text print-text">{data.logistics.shippingWindow}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-os-bg rounded border border-os-border print-panel">
              <span className="text-sm text-os-muted print-muted">Return/Defect Risk</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-os-warning print-text" />
                <span className="font-mono text-os-text print-text">{data.logistics.returnRisk}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-os-bg p-4 rounded border border-os-border border-l-4 border-l-os-accent print-panel">
            <p className="text-sm text-os-muted leading-relaxed print-muted">
              {data.logistics.assessmentText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
