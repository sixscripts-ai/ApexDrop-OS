import React, { useState } from 'react';
import { Phase2Data } from '../types.ts';
import { Target, PenTool, Layers, Calendar, Zap, CheckCircle2, Copy, Check, Code, Video, LineChart as LineChartIcon, Loader2, Mail } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface Props {
  data: Phase2Data;
  videoUrl?: string;
  isVideoGenerating?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Phase2Report: React.FC<Props> = ({ data, videoUrl, isVideoGenerating }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyAdBudget, setDailyAdBudget] = useState(50);
  const [targetRoas, setTargetRoas] = useState(2.5);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string, id: string }) => (
    <button 
      onClick={() => handleCopy(text, id)}
      className="no-print absolute top-2 right-2 p-1.5 bg-os-border hover:bg-os-muted/20 rounded text-os-muted hover:text-os-text transition-colors"
      title="Copy to clipboard"
    >
      {copiedId === id ? <Check className="w-4 h-4 text-os-accent" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  // Generate 12 weeks of interactive data based on sliders
  const interactiveCashFlow = Array.from({ length: 12 }).map((_, i) => {
    const week = i + 1;
    const scaleFactor = targetRoas > 2 ? Math.pow(1.1, i) : 1;
    const adSpend = Math.round(dailyAdBudget * 7 * scaleFactor);
    const revenue = Math.round(adSpend * targetRoas);
    const profit = Math.round(revenue - adSpend - (revenue * 0.35)); // Assume 35% COGS + Shipping
    return { week, revenue, adSpend, profit };
  });

  return (
    <div className="space-y-6 animate-fade-in mt-12 print-panel">
      <div className="flex items-center gap-3 border-b border-os-border pb-4">
        <Zap className="w-6 h-6 text-os-accent print-text" />
        <h2 className="text-2xl font-bold text-os-text tracking-tight print-text">PHASE 2: GO-TO-MARKET BLUEPRINT</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience & Angles */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Audience & Angles</h3>
          </div>
          <div className="mb-4 relative">
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Target Persona</h4>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <p className="text-sm text-os-text leading-relaxed pr-8 print-text">
                {data.targetAudience.persona}
              </p>
              <CopyBtn text={data.targetAudience.persona} id="persona" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Core Angles</h4>
            <ul className="space-y-2">
              {data.targetAudience.coreAngles.map((angle, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-os-text print-text">
                  <CheckCircle2 className="w-4 h-4 text-os-accent mt-0.5 shrink-0 print-text" />
                  <span>{angle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copywriting & Video */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Direct-Response Assets</h3>
          </div>
          <div className="mb-4 relative">
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">SEO Title</h4>
            <div className="bg-os-bg p-2 rounded border border-os-border print-panel">
              <p className="text-sm font-mono text-os-accent pr-8 print-text">
                {data.copywriting.seoTitle}
              </p>
              <CopyBtn text={data.copywriting.seoTitle} id="title" />
            </div>
          </div>
          <div className="mb-4 relative">
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Bullet Points</h4>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <ul className="list-disc list-inside space-y-1 text-sm text-os-text pr-8 print-text">
                {data.copywriting.bulletPoints.map((bp, idx) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
              <CopyBtn text={data.copywriting.bulletPoints.join('\n')} id="bullets" />
            </div>
          </div>
          <div className="relative mb-4">
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Video Hook Script</h4>
            <div className="border-l-2 border-os-accent pl-3 py-1 relative">
              <p className="text-sm italic text-os-text pr-8 print-text">
                "{data.copywriting.videoHookScript}"
              </p>
              <CopyBtn text={data.copywriting.videoHookScript} id="hook" />
            </div>
          </div>
          
          {/* Video Ad Player */}
          <div className="mt-auto pt-4 border-t border-os-border no-print">
            <h4 className="text-xs text-os-muted uppercase mb-2 flex items-center gap-1">
              <Video className="w-4 h-4" /> Autonomous Video Ad (Veo 2.0)
            </h4>
            {isVideoGenerating ? (
              <div className="w-full h-32 bg-os-bg border border-os-border border-dashed rounded flex flex-col items-center justify-center text-os-muted">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-os-accent" />
                <span className="text-xs font-mono">Generating Video (Takes ~2 mins)...</span>
              </div>
            ) : videoUrl ? (
              <video src={videoUrl} controls className="w-full rounded border border-os-border" />
            ) : (
              <div className="w-full h-24 bg-os-bg border border-os-border border-dashed rounded flex items-center justify-center text-os-muted">
                <span className="text-xs font-mono">Video generation failed or unavailable.</span>
              </div>
            )}
          </div>
        </div>

        {/* Offer Architecture */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Offer Architecture</h3>
          </div>
          <div className="mb-4 relative">
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">Core Structure</h4>
            <div className="bg-os-bg p-3 rounded border border-os-border print-panel">
              <p className="text-sm text-os-text pr-8 print-text">
                {data.offerArchitecture.structure}
              </p>
              <CopyBtn text={data.offerArchitecture.structure} id="offer" />
            </div>
          </div>
          <div>
            <h4 className="text-xs text-os-muted uppercase mb-2 print-muted">AOV Boosters</h4>
            <div className="flex flex-wrap gap-2">
              {data.offerArchitecture.aovBoosters.map((booster, idx) => (
                <span key={idx} className="text-xs bg-os-border text-os-text px-2 py-1 rounded print-panel print-text">
                  {booster}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">90-Day Deployment</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-2 border-os-warning pl-3">
              <h4 className="text-xs font-mono text-os-warning uppercase mb-1 print-text">Phase 1: 3-Day Test</h4>
              <p className="text-sm text-os-text print-text">{data.actionPlan.day1to3Test}</p>
            </div>
            
            <div className="border-l-2 border-os-info pl-3">
              <h4 className="text-xs font-mono text-os-info uppercase mb-1 print-text">Phase 2: Day 4-90 Scale</h4>
              <p className="text-sm text-os-text print-text">{data.actionPlan.day4to90Scale}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-os-border flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2">
                <h4 className="text-xs text-os-muted uppercase mb-3 print-muted">Budget Allocation</h4>
                <div className="space-y-2">
                  {data.actionPlan.budgetMatrix.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <div className="flex-grow text-xs text-os-text truncate print-text">{item.channel}</div>
                      <div className="w-10 text-right text-xs font-mono text-os-muted print-muted">
                        {item.allocationPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-1/2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.actionPlan.budgetMatrix}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="allocationPercentage"
                      stroke="none"
                    >
                      {data.actionPlan.budgetMatrix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#e4e4e7', fontSize: '12px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Marketing Flows */}
      {data.emailMarketing && data.emailMarketing.length > 0 && (
        <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Automated Email Flows</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.emailMarketing.map((email, idx) => (
              <div key={idx} className="bg-os-bg p-4 rounded border border-os-border relative print-panel">
                <h4 className="text-xs font-bold text-os-accent mb-3 print-text">{email.type}</h4>
                <div className="mb-1">
                  <span className="text-xs text-os-muted print-muted">Subject:</span> 
                  <span className="text-sm font-semibold ml-2 print-text">{email.subject}</span>
                </div>
                <div className="mb-3">
                  <span className="text-xs text-os-muted print-muted">Preview:</span> 
                  <span className="text-sm italic ml-2 print-text">{email.previewText}</span>
                </div>
                <div className="pt-3 border-t border-os-border">
                  <p className="text-sm whitespace-pre-wrap print-text">{email.body}</p>
                </div>
                <CopyBtn text={`Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}`} id={`email-${idx}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-Week Cash Flow Simulator */}
      <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-os-accent print-text" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider print-text">Interactive Cash Flow Simulator</h3>
          </div>
          <span className="text-xs bg-os-accent/20 text-os-accent px-2 py-1 rounded no-print">Live Calc</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 no-print">
          <div>
            <div className="flex justify-between text-xs text-os-muted mb-1">
              <span>Daily Ad Budget ($)</span>
              <span>${dailyAdBudget}</span>
            </div>
            <input type="range" min="10" max="500" step="10" value={dailyAdBudget} onChange={(e) => setDailyAdBudget(Number(e.target.value))} className="w-full accent-os-info" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-os-muted mb-1">
              <span>Target ROAS</span>
              <span>{targetRoas}x</span>
            </div>
            <input type="range" min="0.5" max="5" step="0.1" value={targetRoas} onChange={(e) => setTargetRoas(Number(e.target.value))} className="w-full accent-os-warning" />
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={interactiveCashFlow} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="week" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Wk ${val}`} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', color: '#e4e4e7' }}
                itemStyle={{ color: '#e4e4e7' }}
                formatter={(value: number) => [`$${value}`, undefined]}
                labelFormatter={(label) => `Week ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="adSpend" name="Ad Spend" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Landing Page Generator */}
      <div className="bg-os-panel border border-os-border rounded-lg p-5 print-panel print-break-inside no-print">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Live Landing Page Preview</h3>
          </div>
          <div className="flex gap-2">
            <CopyBtn text={data.landingPageCode} id="lp-code" />
          </div>
        </div>
        <div className="bg-white border border-os-border rounded overflow-hidden h-[500px]">
          <iframe 
            srcDoc={data.landingPageCode} 
            className="w-full h-full border-none"
            title="Landing Page Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};
