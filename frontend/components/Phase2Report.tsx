import React from 'react';
import { Phase2Data } from '../types.ts';
import { Target, PenTool, Layers, Calendar, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  data: Phase2Data;
}

export const Phase2Report: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in mt-12">
      <div className="flex items-center gap-3 border-b border-os-border pb-4">
        <Zap className="w-6 h-6 text-os-accent" />
        <h2 className="text-2xl font-bold text-os-text tracking-tight">PHASE 2: GO-TO-MARKET BLUEPRINT</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience & Angles */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Audience & Angles</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-xs text-os-muted uppercase mb-2">Target Persona</h4>
            <p className="text-sm text-os-text bg-os-bg p-3 rounded border border-os-border leading-relaxed">
              {data.targetAudience.persona}
            </p>
          </div>
          <div>
            <h4 className="text-xs text-os-muted uppercase mb-2">Core Angles</h4>
            <ul className="space-y-2">
              {data.targetAudience.coreAngles.map((angle, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-os-text">
                  <CheckCircle2 className="w-4 h-4 text-os-accent mt-0.5 shrink-0" />
                  <span>{angle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copywriting */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Direct-Response Assets</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-xs text-os-muted uppercase mb-2">SEO Title</h4>
            <p className="text-sm font-mono text-os-accent bg-os-bg p-2 rounded border border-os-border">
              {data.copywriting.seoTitle}
            </p>
          </div>
          <div className="mb-4">
            <h4 className="text-xs text-os-muted uppercase mb-2">Bullet Points</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-os-text bg-os-bg p-3 rounded border border-os-border">
              {data.copywriting.bulletPoints.map((bp, idx) => (
                <li key={idx}>{bp}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs text-os-muted uppercase mb-2">Video Hook Script</h4>
            <p className="text-sm italic text-os-text border-l-2 border-os-accent pl-3 py-1">
              "{data.copywriting.videoHookScript}"
            </p>
          </div>
        </div>

        {/* Offer Architecture */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">Offer Architecture</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-xs text-os-muted uppercase mb-2">Core Structure</h4>
            <p className="text-sm text-os-text bg-os-bg p-3 rounded border border-os-border">
              {data.offerArchitecture.structure}
            </p>
          </div>
          <div>
            <h4 className="text-xs text-os-muted uppercase mb-2">AOV Boosters</h4>
            <div className="flex flex-wrap gap-2">
              {data.offerArchitecture.aovBoosters.map((booster, idx) => (
                <span key={idx} className="text-xs bg-os-border text-os-text px-2 py-1 rounded">
                  {booster}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-os-panel border border-os-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-os-accent" />
            <h3 className="text-sm font-mono text-os-text uppercase tracking-wider">90-Day Deployment</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-2 border-os-warning pl-3">
              <h4 className="text-xs font-mono text-os-warning uppercase mb-1">Phase 1: 3-Day Test</h4>
              <p className="text-sm text-os-text">{data.actionPlan.day1to3Test}</p>
            </div>
            
            <div className="border-l-2 border-os-info pl-3">
              <h4 className="text-xs font-mono text-os-info uppercase mb-1">Phase 2: Day 4-90 Scale</h4>
              <p className="text-sm text-os-text">{data.actionPlan.day4to90Scale}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-os-border">
              <h4 className="text-xs text-os-muted uppercase mb-3">Budget Allocation Matrix</h4>
              <div className="space-y-2">
                {data.actionPlan.budgetMatrix.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-os-text truncate">{item.channel}</div>
                    <div className="flex-grow h-2 bg-os-bg rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-os-accent" 
                        style={{ width: `${item.allocationPercentage}%` }}
                      ></div>
                    </div>
                    <div className="w-10 text-right text-xs font-mono text-os-muted">
                      {item.allocationPercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
