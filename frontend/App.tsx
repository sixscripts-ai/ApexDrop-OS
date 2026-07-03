import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal, Search, Cpu, AlertCircle, Download, History, Menu, X, Link as LinkIcon, FileText, Table, Bookmark, Trash2, DownloadCloud, Upload, MessageSquare, Send, Mic, MicOff, Printer } from 'lucide-react';
import { generateProductOptionsStream, generateFullReportStream, generateProductImage, generateProductVideo, initStrategistChat } from './services/geminiService.ts';
import { AppStep, OrchestratorResponse, ProductOption, HistoryItem, ChatMessage } from './types.ts';
import { TerminalLoader } from './components/TerminalLoader.tsx';
import { Phase1Report } from './components/Phase1Report.tsx';
import { Phase2Report } from './components/Phase2Report.tsx';
import { Chat, GoogleGenAI } from '@google/genai';

// Audio Utility Functions for Live API
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const App: React.FC = () => {
  const [seedInput, setSeedInput] = useState('');
  const [mode, setMode] = useState<'niche' | 'xray'>('niche');
  const [step, setStep] = useState<AppStep>('idle');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [data, setData] = useState<OrchestratorResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [streamText, setStreamText] = useState<string>('');
  
  // Storage & Sidebar State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'recent' | 'saved'>('recent');
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Video State
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  // Chat Strategist State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatInstanceRef = useRef<Chat | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('apexdrop_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    // Cleanup function for Live API audio resources
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const saveToHistory = (seed: string, reportData: OrchestratorResponse): string => {
    const newId = Date.now().toString();
    const newItem: HistoryItem = {
      id: newId,
      date: new Date().toLocaleString(),
      seed,
      data: reportData,
      isSaved: false
    };
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('apexdrop_history', JSON.stringify(newHistory));
    setCurrentHistoryId(newId);
    return newId;
  };

  const toggleSaveItem = (id: string) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, isSaved: !item.isSaved } : item
    );
    setHistory(updatedHistory);
    localStorage.setItem('apexdrop_history', JSON.stringify(updatedHistory));
  };

  const toggleSaveCurrent = () => {
    if (currentHistoryId) toggleSaveItem(currentHistoryId);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('apexdrop_history', JSON.stringify(updatedHistory));
    if (currentHistoryId === id) {
      setStep('idle');
      setData(null);
      setCurrentHistoryId(null);
      setIsChatOpen(false);
      if (isLiveActive) toggleLiveAPI();
    }
  };

  const handleExportDatabase = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexdrop_storage_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedHistory = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedHistory)) {
          setHistory(importedHistory);
          localStorage.setItem('apexdrop_history', JSON.stringify(importedHistory));
          alert('Storage database imported successfully!');
        }
      } catch (err) {
        alert('Failed to parse storage file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedInput.trim()) return;

    setStep('loading_options');
    setErrorMsg('');
    setOptions([]);
    setStreamText('');
    setCurrentHistoryId(null);
    setIsChatOpen(false);
    if (isLiveActive) toggleLiveAPI();

    try {
      const generatedOptions = await generateProductOptionsStream(seedInput, mode, (text) => {
        setStreamText(text);
      });
      setOptions(generatedOptions);
      setStep('options');
    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message || 'Failed to generate options.');
    }
  }, [seedInput, mode, isLiveActive]);

  const handleSelectOption = useCallback(async (option: ProductOption) => {
    setStep('loading_report');
    setStreamText('');
    setErrorMsg('');

    try {
      const { data: reportData, urls } = await generateFullReportStream(option, (text) => {
        setStreamText(text);
      });
      
      reportData.groundingUrls = urls;
      setData(reportData);
      setStep('report');

      const newId = saveToHistory(seedInput, reportData);

      // Initialize Chat Strategist
      chatInstanceRef.current = initStrategistChat(reportData);
      setChatMessages([{ role: 'model', text: `Hello! I'm your AI Strategist. I've analyzed the blueprint for **${reportData.phase1.productIdentity}**. How can I help you optimize this campaign?` }]);

      // Fire off image generation
      generateProductImage(reportData.phase1.productIdentity).then(imgUrl => {
        if (imgUrl) {
          setData(prev => prev ? { ...prev, imageUrl: imgUrl } : prev);
          setHistory(prevHist => {
            const updated = prevHist.map(h => h.id === newId ? { ...h, data: { ...h.data, imageUrl: imgUrl } } : h);
            localStorage.setItem('apexdrop_history', JSON.stringify(updated));
            return updated;
          });
        }
      });

      // Fire off video generation
      setIsVideoGenerating(true);
      generateProductVideo(reportData.phase2.copywriting.videoHookScript).then(vidUrl => {
        setIsVideoGenerating(false);
        if (vidUrl) {
          setData(prev => prev ? { ...prev, videoUrl: vidUrl } : prev);
          setHistory(prevHist => {
            const updated = prevHist.map(h => h.id === newId ? { ...h, data: { ...h.data, videoUrl: vidUrl } } : h);
            localStorage.setItem('apexdrop_history', JSON.stringify(updated));
            return updated;
          });
        }
      });

    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message || 'Failed to generate full report.');
    }
  }, [seedInput, history]);

  const loadHistoryItem = (item: HistoryItem) => {
    setSeedInput(item.seed);
    setData(item.data);
    setCurrentHistoryId(item.id);
    setStep('report');
    setIsSidebarOpen(false);
    if (isLiveActive) toggleLiveAPI();
    
    // Re-init chat for loaded item
    chatInstanceRef.current = initStrategistChat(item.data);
    setChatMessages([{ role: 'model', text: `Hello! I'm your AI Strategist. I've loaded the blueprint for **${item.data.phase1.productIdentity}**. How can I help you optimize this campaign?` }]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatInstanceRef.current) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const responseStream = await chatInstanceRef.current.sendMessageStream({ message: userMsg });
      let fullResponse = '';
      
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        setChatMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullResponse;
          return newMsgs;
        });
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleLiveAPI = async () => {
    if (isLiveActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setIsLiveActive(false);
      liveSessionRef.current = null;
      return;
    }

    try {
      setIsLiveActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      audioContextRef.current = outputAudioContext;
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      outputNodeRef.current = outputNode;
      
      nextStartTimeRef.current = 0;
      sourcesRef.current = new Set();

      const ai = new GoogleGenAI({apiKey: process.env.API_KEY, vertexai: true});
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-live-2.5-flash-native-audio',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: any) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContext.currentTime,
              );
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
              );
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live API Error', e),
          onclose: () => {
            setIsLiveActive(false);
            liveSessionRef.current = null;
          }
        },
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
          },
          systemInstruction: `You are the ApexDrop-OS AI Strategist. You are assisting the user with the following dropshipping blueprint:\n\n${JSON.stringify(data)}\n\nAnswer questions, provide variations of copy, suggest new targeting angles, or explain the cash flow projections based on this context. Keep answers concise, highly actionable, and professional.`,
        }
      });

      liveSessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start Live API", err);
      setIsLiveActive(false);
    }
  };

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const handleExportMD = useCallback(() => {
    if (!data) return;
    const markdownContent = `# ApexDrop-OS Execution Report\n**Seed Input:** ${seedInput}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n## [Phase 1: The Product Verdict]\n\n**Product Identity:** ${data.phase1.productIdentity}\n**Niche:** ${data.phase1.niche}\n\n### Trend & Momentum Analysis\n* **Momentum Score:** ${data.phase1.trendAnalysis.momentumScore}/10\n* **Trend Type:** ${data.phase1.trendAnalysis.trendType}\n* **Peak Timing:** ${data.phase1.trendAnalysis.peakTiming}\n* **Market Status:** ${data.phase1.trendAnalysis.marketStatus}\n* **Competition Density:** ${data.phase1.trendAnalysis.competitionDensity}\n* **Sustainability:** ${data.phase1.trendAnalysis.sustainabilityAnalysis}\n\n### Sourcing & Supplier Intelligence\n* **Optimal Method:** ${data.phase1.sourcingStrategy.method}\n* **Recommended Platforms:** ${data.phase1.sourcingStrategy.recommendedSuppliers.map(s => s.name).join(', ')}\n* **Strategic Reasoning:** ${data.phase1.sourcingStrategy.reasoning}\n* **Integration Steps:** ${data.phase1.sourcingStrategy.integrationSteps}\n\n### Supplier & Unit Economics Breakdown\n* **COGS:** $${data.phase1.supplierEconomics.cogs.toFixed(2)}\n* **Retail Price:** $${data.phase1.supplierEconomics.retailPrice.toFixed(2)}\n* **Net Margin:** ${data.phase1.supplierEconomics.netMargin}%\n* **Analysis:** ${data.phase1.supplierEconomics.breakdownText}\n\n### Logistics & Risk Assessment\n* **Primary Supplier:** ${data.phase1.logistics.primarySupplier}\n* **Shipping Window:** ${data.phase1.logistics.shippingWindow}\n* **Return/Defect Risk:** ${data.phase1.logistics.returnRisk}\n* **Assessment:** ${data.phase1.logistics.assessmentText}\n\n### Market & Viability Score\n* **Score:** ${data.phase1.viabilityScore}/10\n* **Details:** ${data.phase1.viabilityText}\n\n---\n\n## [Phase 2: The Go-To-Market Blueprint]\n\n### Target Audience Persona & Core Angles\n* **Persona:** ${data.phase2.targetAudience.persona}\n* **Core Angles:**\n${data.phase2.targetAudience.coreAngles.map(angle => `  - ${angle}`).join('\n')}\n\n### Direct-Response Copy & Creative Scripts\n* **SEO Title:** ${data.phase2.copywriting.seoTitle}\n* **Bullet Points:**\n${data.phase2.copywriting.bulletPoints.map(bp => `  - ${bp}`).join('\n')}\n* **Video Hook Script:** \n> "${data.phase2.copywriting.videoHookScript}"\n\n### Offer Structure & AOV Boosters\n* **Structure:** ${data.phase2.offerArchitecture.structure}\n* **AOV Boosters:**\n${data.phase2.offerArchitecture.aovBoosters.map(booster => `  - ${booster}`).join('\n')}\n\n### 90-Day Omnichannel Action Plan & Testing Framework\n* **Phase 1 (3-Day Test):** ${data.phase2.actionPlan.day1to3Test}\n* **Phase 2 (Day 4-90 Scale):** ${data.phase2.actionPlan.day4to90Scale}\n* **Budget Allocation Matrix:**\n${data.phase2.actionPlan.budgetMatrix.map(item => `  - ${item.channel}: ${item.allocationPercentage}%`).join('\n')}\n\n### 12-Week Cash Flow Projections\n${data.phase2.actionPlan.cashFlowProjections.map(p => `* Week ${p.week}: Rev $${p.revenue}, Spend $${p.adSpend}, Profit $${p.profit}`).join('\n')}\n\n### Email Marketing Flows\n${data.phase2.emailMarketing?.map(email => `#### ${email.type}\n* **Subject:** ${email.subject}\n* **Preview:** ${email.previewText}\n\n${email.body}\n`).join('\n')}\n\n### Landing Page Code (HTML/Tailwind)\n\`\`\`html\n${data.phase2.landingPageCode}\n\`\`\``;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexDrop_Report_${seedInput.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, seedInput]);

  const handleExportCSV = useCallback(() => {
    if (!data) return;
    const handle = data.phase1.productIdentity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const title = `"${data.phase2.copywriting.seoTitle.replace(/"/g, '""')}"`;
    const bodyHtml = `"<ul>${data.phase2.copywriting.bulletPoints.map(bp => `<li>${bp.replace(/"/g, '""')}</li>`).join('')}</ul>"`;
    const vendor = "ApexDrop";
    const type = `"${data.phase1.niche.replace(/"/g, '""')}"`;
    const price = data.phase1.supplierEconomics.retailPrice;
    const imageSrc = data.imageUrl ? `"${data.imageUrl}"` : "";
    const csvContent = `Handle,Title,Body (HTML),Vendor,Type,Published,Variant Price,Image Src\n${handle},${title},${bodyHtml},${vendor},${type},TRUE,${price},${imageSrc}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify_import_${handle}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const displayedHistory = history.filter(item => sidebarTab === 'saved' ? item.isSaved : true);
  const currentItem = history.find(h => h.id === currentHistoryId);
  const isCurrentSaved = currentItem?.isSaved || false;

  return (
    <div className="min-h-screen bg-os-bg text-os-text flex">
      
      {/* Sidebar Storage Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-os-panel border-r border-os-border transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} no-print`}>
        <div className="p-4 flex justify-between items-center border-b border-os-border shrink-0">
          <h2 className="font-bold flex items-center gap-2"><History className="w-4 h-4" /> Storage</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-os-muted hover:text-os-text"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex border-b border-os-border shrink-0">
          <button 
            onClick={() => setSidebarTab('recent')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${sidebarTab === 'recent' ? 'text-os-accent border-b-2 border-os-accent bg-os-bg' : 'text-os-muted hover:text-os-text hover:bg-os-bg/50'}`}
          >
            Recent
          </button>
          <button 
            onClick={() => setSidebarTab('saved')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${sidebarTab === 'saved' ? 'text-os-accent border-b-2 border-os-accent bg-os-bg' : 'text-os-muted hover:text-os-text hover:bg-os-bg/50'}`}
          >
            Saved
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {displayedHistory.length === 0 ? (
            <p className="text-sm text-os-muted text-center mt-4">No sequences found.</p>
          ) : (
            displayedHistory.map(item => (
              <div 
                key={item.id} 
                onClick={() => loadHistoryItem(item)} 
                className={`p-3 bg-os-bg border ${currentHistoryId === item.id ? 'border-os-accent' : 'border-os-border'} rounded cursor-pointer hover:border-os-accent transition-colors group relative`}
              >
                <div className="pr-6">
                  <p className="text-sm font-bold truncate">{item.seed}</p>
                  <p className="text-xs text-os-muted mt-1">{item.date}</p>
                </div>
                <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSaveItem(item.id); }} 
                    className="text-os-muted hover:text-os-accent"
                    title={item.isSaved ? "Remove Bookmark" : "Bookmark Sequence"}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-os-accent text-os-accent' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)} 
                    className="text-os-muted hover:text-os-danger"
                    title="Delete Sequence"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.isSaved && (
                  <Bookmark className="w-3 h-3 fill-os-accent text-os-accent absolute right-2 bottom-2 opacity-100 group-hover:opacity-0 transition-opacity" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-os-border shrink-0 space-y-2 bg-os-bg/50">
          <button 
            onClick={handleExportDatabase} 
            className="w-full py-2 text-xs font-mono text-os-text bg-os-panel border border-os-border rounded hover:border-os-accent transition-colors flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" /> Backup Storage
          </button>
          <label className="w-full py-2 text-xs font-mono text-os-text bg-os-panel border border-os-border rounded hover:border-os-info transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> Import Storage
            <input type="file" accept=".json" className="hidden" onChange={handleImportDatabase} />
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 selection:bg-os-accent selection:text-os-bg overflow-x-hidden relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <header className="mb-12 flex flex-col items-center text-center relative">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-0 p-2 text-os-muted hover:text-os-text no-print flex items-center gap-2"
            >
              <Menu className="w-6 h-6" />
              <span className="text-sm font-mono hidden sm:inline-block">STORAGE</span>
            </button>
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
          {(step === 'idle' || step === 'error') && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('niche')}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'niche' ? 'bg-os-accent text-os-bg' : 'bg-os-panel text-os-muted border border-os-border hover:text-os-text'}`}
                >
                  [ Niche Discovery ]
                </button>
                <button
                  type="button"
                  onClick={() => setMode('xray')}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'xray' ? 'bg-os-info text-os-bg' : 'bg-os-panel text-os-muted border border-os-border hover:text-os-text'}`}
                >
                  [ Competitor X-Ray ]
                </button>
              </div>
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-os-accent to-os-info rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-os-panel border border-os-border rounded-lg p-2 shadow-2xl">
                  <Search className="w-6 h-6 text-os-muted ml-3" />
                  <input
                    type="text"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder={mode === 'niche' ? "Enter seed niche or trend..." : "Enter competitor URL or brand..."}
                    className="w-full bg-transparent border-none outline-none text-os-text px-4 py-3 placeholder-os-muted/50 font-mono text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!seedInput.trim()}
                    className="bg-os-accent hover:bg-os-accentHover text-os-bg font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Terminal className="w-4 h-4" />
                    EXECUTE
                  </button>
                </div>
              </form>

              {step === 'error' && (
                <div className="mt-6 bg-os-danger/10 border border-os-danger/50 rounded-lg p-4 flex items-start gap-3 text-os-danger">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">SYSTEM_ERROR</h4>
                    <p className="text-sm opacity-90">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading States */}
          {step === 'loading_options' && (
            <div className="py-12">
              <TerminalLoader streamText={streamText} title="SCOUT_MODULE: DISCOVERING_OPTIONS" />
            </div>
          )}

          {step === 'loading_report' && (
            <div className="py-12">
              <TerminalLoader streamText={streamText} title="MARKETER_MODULE: GENERATING_BLUEPRINT" />
            </div>
          )}

          {/* Options Selection */}
          {step === 'options' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-center">Select a Product Vector to Deploy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map(opt => (
                  <div 
                    key={opt.id} 
                    onClick={() => handleSelectOption(opt)}
                    className="bg-os-panel border border-os-border rounded-lg p-5 cursor-pointer hover:border-os-accent hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex flex-col"
                  >
                    <div className="text-xs font-mono text-os-accent mb-2">Est. Viability: {opt.viabilityEstimate}/10</div>
                    <h4 className="text-lg font-bold mb-1">{opt.name}</h4>
                    <span className="text-xs bg-os-bg px-2 py-1 rounded w-fit mb-3 border border-os-border">{opt.niche}</span>
                    <p className="text-sm text-os-muted flex-grow">{opt.description}</p>
                    <button className="mt-4 w-full py-2 bg-os-bg border border-os-border rounded text-sm font-bold hover:bg-os-accent hover:text-os-bg transition-colors">
                      DEPLOY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Dashboard */}
          {step === 'report' && data && (
            <div className="pb-20">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 no-print">
                <div className="font-mono text-sm text-os-accent flex items-center gap-2">
                  <span className="w-2 h-2 bg-os-accent rounded-full animate-pulse"></span>
                  SEQUENCE_COMPLETE
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={toggleSaveCurrent}
                    className={`text-sm font-mono transition-colors border px-4 py-2 rounded flex items-center gap-2 ${isCurrentSaved ? 'text-os-bg bg-os-accent border-os-accent hover:bg-os-accentHover' : 'text-os-accent border-os-accent bg-os-panel hover:bg-os-accent hover:text-os-bg'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isCurrentSaved ? 'fill-current' : ''}`} />
                    {isCurrentSaved ? '[ SAVED ]' : '[ SAVE_SEQUENCE ]'}
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="text-sm font-mono text-os-warning hover:text-os-bg transition-colors border border-os-warning px-4 py-2 rounded bg-os-panel hover:bg-os-warning flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    [ EXPORT_PDF ]
                  </button>
                  <button 
                    onClick={handleExportMD}
                    className="text-sm font-mono text-os-text hover:text-os-bg transition-colors border border-os-border px-4 py-2 rounded bg-os-panel hover:bg-os-text flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    [ EXPORT_MD ]
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="text-sm font-mono text-os-info hover:text-os-bg transition-colors border border-os-info px-4 py-2 rounded bg-os-panel hover:bg-os-info flex items-center gap-2"
                  >
                    <Table className="w-4 h-4" />
                    [ EXPORT_CSV ]
                  </button>
                  <button 
                    onClick={() => {
                      setStep('idle');
                      setSeedInput('');
                      setCurrentHistoryId(null);
                      setIsChatOpen(false);
                      if (isLiveActive) toggleLiveAPI();
                    }}
                    className="text-sm font-mono text-os-muted hover:text-os-text transition-colors border border-os-border px-4 py-2 rounded bg-os-panel hover:bg-os-border"
                  >
                    [ RESET_SYSTEM ]
                  </button>
                </div>
              </div>
              
              <Phase1Report data={data.phase1} imageUrl={data.imageUrl} />
              <Phase2Report data={data.phase2} videoUrl={data.videoUrl} isVideoGenerating={isVideoGenerating} />

              {/* Grounding URLs */}
              {data.groundingUrls && data.groundingUrls.length > 0 && (
                <div className="mt-8 p-5 bg-os-panel border border-os-border rounded-lg no-print">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-os-info" />
                    Live Web Grounding Sources
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-os-info space-y-1">
                    {data.groundingUrls.map((url, i) => (
                      <li key={i}><a href={url} target="_blank" rel="noreferrer" className="hover:underline break-all">{url}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Floating AI Strategist Chat */}
      {step === 'report' && (
        <div className="fixed bottom-6 right-6 z-50 no-print flex flex-col items-end">
          {isChatOpen && (
            <div className="bg-os-panel border border-os-border rounded-lg shadow-2xl w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden animate-fade-in">
              <div className="bg-os-bg border-b border-os-border p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-os-accent" />
                  <span className="text-sm font-bold">AI Strategist</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleLiveAPI} 
                    className={`p-1.5 rounded-full transition-colors ${isLiveActive ? 'bg-os-danger text-white animate-pulse' : 'bg-os-panel border border-os-border text-os-muted hover:text-os-text'}`}
                    title={isLiveActive ? "Stop Voice Chat" : "Start Voice Chat"}
                  >
                    {isLiveActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="text-os-muted hover:text-os-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-os-accent text-os-bg rounded-br-none' : 'bg-os-bg border border-os-border text-os-text rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-os-bg border border-os-border p-3 rounded-lg rounded-bl-none flex gap-1">
                      <div className="w-2 h-2 bg-os-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-os-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-os-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="p-3 border-t border-os-border bg-os-bg flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for new angles, copy..."
                  className="flex-1 bg-os-panel border border-os-border rounded px-3 py-2 text-sm outline-none focus:border-os-accent"
                  disabled={isChatLoading || isLiveActive}
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isChatLoading || isLiveActive}
                  className="bg-os-accent text-os-bg p-2 rounded hover:bg-os-accentHover disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${isChatOpen ? 'bg-os-panel border border-os-border text-os-text' : 'bg-os-accent text-os-bg'}`}
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
