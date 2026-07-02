import React, { useState, useCallback } from 'react';
import { Terminal, Search, Cpu, AlertCircle } from 'lucide-react';
import { runOrchestrator } from './services/geminiService.ts';
import { AppStatus, OrchestratorResponse } from './types.ts';
import { TerminalLoader } from './components/TerminalLoader.tsx';
import { Phase1Report } from './components/Phase1Report.tsx';
import { Phase2Report } from './components/Phase2Report.tsx';

const App: React.FC = () => {
  const [seedInput, setSeedInput] = useState('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [data, setData] = useState<OrchestratorResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleExecute = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedInput.trim()) return;

    setStatus('running');
    setErrorMsg('');
    setData(null);

    try {
      const result = await runOrchestrator(seedInput);
      setData(result);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An unknown error occurred during execution.');
    }
  }, [seedInput]);

  return (
    <div className="min-h-screen bg-os-bg text-os-text p-4 md:p-8 selection:bg-os-accent selection:text-os-bg">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 bg-os-panel border border-os-border rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Cpu className="w-10 h-10 text-os-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
            ApexDrop<span className="text-os-accent">-OS</span>
          </h1>
          <p className="text-os-muted max-w-2xl text-sm md:text-base font-mono">
            Multi-Agent Orchestrator // Trend Discovery & Growth Engine
          </p>
        </header>

        {/* Input Section */}
        {status === 'idle' || status === 'error' ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <form onSubmit={handleExecute} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-os-accent to-os-info rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-os-panel border border-os-border rounded-lg p-2 shadow-2xl">
                <Search className="w-6 h-6 text-os-muted ml-3" />
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="Enter seed niche, trend, or product idea (e.g., 'Trending fitness gear', 'Pet tech')"
                  className="w-full bg-transparent border-none outline-none text-os-text px-4 py-3 placeholder-os-muted/50 font-mono text-sm"
                  disabled={status === 'running'}
                />
                <button
                  type="submit"
                  disabled={!seedInput.trim() || status === 'running'}
                  className="bg-os-accent hover:bg-os-accentHover text-os-bg font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  EXECUTE
                </button>
              </div>
            </form>

            {status === 'error' && (
              <div className="mt-6 bg-os-danger/10 border border-os-danger/50 rounded-lg p-4 flex items-start gap-3 text-os-danger">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">SYSTEM_ERROR</h4>
                  <p className="text-sm opacity-90">{errorMsg}</p>
                </div>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-os-muted font-mono">
              <div className="bg-os-panel p-4 rounded border border-os-border">
                <h4 className="text-os-text font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-os-accent rounded-full"></span>
                  Module 1: The Scout
                </h4>
                <ul className="space-y-1 opacity-80">
                  <li>- BSR & Trend Momentum Analysis</li>
                  <li>- Unit Economics Validation</li>
                  <li>- Supplier Logistics Filtering</li>
                  <li>- Market Viability Scoring</li>
                </ul>
              </div>
              <div className="bg-os-panel p-4 rounded border border-os-border">
                <h4 className="text-os-text font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-os-info rounded-full"></span>
                  Module 2: The Marketer
                </h4>
                <ul className="space-y-1 opacity-80">
                  <li>- Competitive Intelligence</li>
                  <li>- Direct-Response Assets</li>
                  <li>- Offer Architecture</li>
                  <li>- Omnichannel Deployment</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Loading State */}
        {status === 'running' && (
          <div className="py-12">
            <TerminalLoader />
          </div>
        )}

        {/* Results Dashboard */}
        {status === 'success' && data && (
          <div className="pb-20">
            <div className="flex justify-between items-center mb-8">
              <div className="font-mono text-sm text-os-accent flex items-center gap-2">
                <span className="w-2 h-2 bg-os-accent rounded-full animate-pulse"></span>
                SEQUENCE_COMPLETE
              </div>
              <button 
                onClick={() => {
                  setStatus('idle');
                  setSeedInput('');
                }}
                className="text-sm font-mono text-os-muted hover:text-os-text transition-colors border border-os-border px-4 py-2 rounded bg-os-panel hover:bg-os-border"
              >
                [ RESET_SYSTEM ]
              </button>
            </div>
            
            <Phase1Report data={data.phase1} />
            <Phase2Report data={data.phase2} />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
