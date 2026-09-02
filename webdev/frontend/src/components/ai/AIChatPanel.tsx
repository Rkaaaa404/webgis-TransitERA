'use client';

import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { AIChatMessage, StationId } from '@/types';
import { PersonaType } from '@/lib/persona';
import { queryAI } from '@/lib/api';
import { CuratedPromptChips } from './CuratedPromptChips';
import { Sparkles, Send, Bot, User, X, Loader2, Compass } from 'lucide-react';

interface AIChatPanelProps {
  activeStation: StationId;
  activePersona: PersonaType;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
  onClose?: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  activeStation,
  activePersona,
  activeH3Index,
  onExecuteMapAction,
  onClose
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Halo! Saya **TransitERA AI**. Tanyakan kesiapan TOD di 5 stasiun Surabaya, komparasi antarsimpul, estimasi kenaikan nilai tanah (%ΔNJOP), atau profil kesesuaian lokasi usaha UMKM.',
      timestamp: 'Baru saja'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sanitizeHtml = (rawHtml: string) => {
    const formattedHtml = rawHtml
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Use DOMPurify only on the client side where window is available
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(formattedHtml);
    }
    return formattedHtml;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let contextPrefix = `[Konteks: Stasiun ${activeStation.toUpperCase()}`;
      if (activeH3Index) {
        contextPrefix += ` | H3 Heksagon: ${activeH3Index}`;
      }
      contextPrefix += ` | Persona: ${activePersona.toUpperCase()}] `;
      
      const augmentedPrompt = contextPrefix + textToSend.trim();

      const response = await queryAI(augmentedPrompt, activeStation);
      const aiData = response?.data;

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiData?.text_response || 'Berhasil memproses kueri spasial Anda.',
        action: aiData?.action,
        targetStation: aiData?.target_station,
        chartPayload: aiData?.chart_payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Execute map trigger if callback provided
      if (onExecuteMapAction && aiData) {
        onExecuteMapAction(aiData);
      }
    } catch (err) {
      console.error('AI Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Maaf, terjadi gangguan saat menghubungi proxy AI. Silakan coba kembali dengan curated prompt.',
          timestamp: 'Sekarang'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 text-slate-200 border-l border-slate-800 shadow-2xl">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-teal" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              TransitERA AI
              <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">Asisten Spasial Cerdas</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages List Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-teal to-brand-blue flex-shrink-0 flex items-center justify-center text-white mt-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-brand-lime" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-blue text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(msg.text)
                }}
              />

              {/* Interactive Spatial Action Badge */}
              {msg.action && msg.sender === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-brand-lime font-semibold">
                    <Compass className="w-3 h-3" />
                    <span>Aksi Peta: {msg.action.replace('_', ' ')}</span>
                  </div>
                  {msg.targetStation && (
                    <span className="bg-brand-lime/10 text-brand-lime px-1.5 py-0.5 rounded uppercase font-bold text-[9px] border border-brand-lime/30">
                      {msg.targetStation}
                    </span>
                  )}
                </div>
              )}

              {/* Interactive Chart Payload Summary Card */}
              {msg.chartPayload && msg.sender === 'assistant' && (
                <div className="mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
                  <div className="font-bold text-slate-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                    {msg.chartPayload.title || 'Data Analitik Spasial'}
                  </div>
                  {msg.chartPayload.type === 'radar_5d' && msg.chartPayload.data?.scores && (
                    <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 pt-1">
                      <div>Density: <strong className="text-slate-200">{msg.chartPayload.data.scores.density}</strong></div>
                      <div>Diversity: <strong className="text-slate-200">{msg.chartPayload.data.scores.diversity}</strong></div>
                      <div>Design: <strong className="text-slate-200">{msg.chartPayload.data.scores.design}</strong></div>
                      <div>Destination: <strong className="text-slate-200">{msg.chartPayload.data.scores.destination_accessibility}</strong></div>
                    </div>
                  )}
                  {msg.chartPayload.type === 'njop_premium_stats' && msg.chartPayload.data && (
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-slate-400">Rerata %ΔNJOP:</span>
                      <strong className="text-brand-lime font-bold">+{msg.chartPayload.data.avg_njop_premium_pct}%</strong>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-brand-lime' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 mt-1">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-brand-teal bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Menganalisis data spasial & menjalankan fungsi...</span>
          </div>
        )}
      </div>

      {/* Curated Prompt Chips */}
      <div className="px-3.5 py-2 bg-slate-900/40 border-t border-slate-800/80">
        <CuratedPromptChips onSelectPrompt={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
          suppressHydrationWarning
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan analisis spasial TOD / ketik prompt..."
            disabled={isLoading}
            className="flex-1 bg-slate-950/80 border border-slate-700 focus:border-brand-teal rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-teal transition-colors disabled:opacity-50"
            suppressHydrationWarning
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-brand-teal hover:to-blue-500 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-brand-teal/20"
            suppressHydrationWarning
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

