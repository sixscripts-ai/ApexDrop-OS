import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface Props {
  streamText: string;
  title?: string;
}

export const TerminalLoader: React.FC<Props> = ({ streamText, title = "SYSTEM_EXECUTION_LOG" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamText]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-os-panel border border-os-border rounded-lg p-6 font-mono text-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-4 border-b border-os-border pb-4">
        <Terminal className="w-5 h-5 text-os-accent animate-pulse" />
        <span className="text-os-text font-semibold tracking-wider">{title}</span>
        <div className="ml-auto flex gap-2">
          <div className="w-3 h-3 rounded-full bg-os-border"></div>
          <div className="w-3 h-3 rounded-full bg-os-border"></div>
          <div className="w-3 h-3 rounded-full bg-os-accent animate-pulse"></div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="h-80 overflow-y-auto text-os-muted whitespace-pre-wrap break-words"
      >
        {streamText || "Initializing connection to ApexDrop-OS Core..."}
        <span className="text-os-accent animate-pulse ml-1">_</span>
      </div>
    </div>
  );
};
