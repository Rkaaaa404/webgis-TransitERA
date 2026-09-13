'use client';

import React from 'react';
import { Sparkles, BarChart, Scale, AlertTriangle, TrendingUp, Utensils, Sliders, Coffee, Navigation, MessageCircle, Bus } from 'lucide-react';

interface CuratedPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

export const CURATED_PROMPTS_LIST = [
  {
    title: 'Rute Intermoda ke TP',
    prompt: 'Bagaimana rute intermoda tercepat menuju Tunjungan Plaza dari simpul ini?',
    icon: Navigation
  },
  {
    title: 'Koneksi Feeder WiraWiri',
    prompt: 'Rute feeder WiraWiri dan Suroboyo Bus apa saja yang terkoneksi di sini?',
    icon: Bus
  },
  {
    title: 'Sentimen Warga (Survei)',
    prompt: 'Bagaimana hasil survei opini MAPID terkait kenyamanan trotoar dan transum di sini?',
    icon: MessageCircle
  },
  {
    title: 'Kuliner Menu Go Terdekat',
    prompt: 'Rekomendasikan kuliner Menu Go terbaik dalam jarak jalan kaki 300 meter',
    icon: Utensils
  },
  {
    title: 'Skor TOD 5D',
    prompt: 'Tampilkan analisis skor TOD dan dimensi terkuat di sekitar simpul ini',
    icon: BarChart
  },
  {
    title: 'Bandingkan Gubeng & Wonokromo',
    prompt: 'Bandingkan kesiapan TOD Stasiun Gubeng dan Wonokromo',
    icon: Scale
  },
  {
    title: 'Estimasi Nilai Lahan (%ΔNJOP)',
    prompt: 'Berapa estimasi kenaikan nilai tanah di sekitar koridor transit ini?',
    icon: TrendingUp
  },
  {
    title: 'Simulasi Ekstensi Feeder',
    prompt: 'Jika feeder WiraWiri diperpanjang ke simpul ini, apa dampak TOD-nya?',
    icon: Sliders
  }
];

export const CuratedPromptChips: React.FC<CuratedPromptChipsProps> = ({
  onSelectPrompt,
  disabled = false
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-brand-teal tracking-wider">
        <Sparkles className="w-3 h-3 text-brand-teal animate-pulse" />
        Prompt Rekomendasi (Siap Uji)
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {CURATED_PROMPTS_LIST.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex-shrink-0 text-[11px] bg-slate-900/90 hover:bg-brand-teal/20 text-slate-300 hover:text-brand-teal/80 border border-slate-700 hover:border-brand-teal/60 rounded-full px-2.5 py-1 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <IconComp className="w-3 h-3 text-brand-teal" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

