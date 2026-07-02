import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const loadingSteps = [
  "Initializing ApexDrop-OS...",
  "Booting Automated Product Research Engine (The Scout)...",
  "Scanning Amazon & Temu supplier databases...",
  "Analyzing Best Seller Rank (BSR) & Sales Momentum...",
  "Evaluating Seasonal Trends & Market Saturation...",
  "Classifying Trend Sustainability (Evergreen vs. Fad)...",
  "Calculating Unit Economics & Margin Extraction...",
  "Enforcing 3x COGS minimum threshold...",
  "Evaluating Supplier Logistics & Fulfillment Ratings...",
  "Applying Kill Triggers (Shipping > 10d, Defect > 3%)...",
  "Computing Market Viability & Viral Coefficient...",
  "Handoff to Full-Stack Growth Engine (The Marketer)...",
  "Mapping Competitive Intelligence & Personas...",
  "Generating Direct-Response Copywriting Assets...",
  "Architecting Offer & AOV Scaling Structures...",
  "Formulating 90-Day Omnichannel Deployment Plan...",
  "Finalizing Payload..."
];

export const TerminalLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, `> ${loadingSteps[currentStep]}`]);
        setCurrentStep(prev => prev + 1);
      }, Math.random() * 500 + 150); // Slightly faster random delay
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-os-panel border border-os-border rounded-lg p-6 font-mono text-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-4 border-b border-os-border pb-4">
        <Terminal className="w-5 h-5 text-os-accent" />
        <span className="text-os-text font-semibold tracking-wider">SYSTEM_EXECUTION_LOG</span>
        <div className="ml-auto flex gap-2">
          <div className="w-3 h-3 rounded-full bg-os-border"></div>
          <div className="w-3 h-3 rounded-full bg-os-border"></div>
          <div className="w-3 h-3 rounded-full bg-os-accent animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 h-64 overflow-y-auto flex flex-col justify-end">
        {logs.map((log, index) => (
          <div key={index} className="text-os-muted animate-fade-in">
            <span className="text-os-accent mr-2">[{new Date().toISOString().split('T')[1].slice(0, -1)}]</span>
            {log}
          </div>
        ))}
        {currentStep < loadingSteps.length && (
          <div className="text-os-accent animate-pulse mt-2">_</div>
        )}
      </div>
    </div>
  );
};
