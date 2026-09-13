'use client';

import React from 'react';
import {
  Sparkles,
  BarChart,
  Scale,
  TrendingUp,
  Utensils,
  Sliders,
  Navigation,
  MessageCircle,
  Bus,
  Compass,
  CreditCard,
  Building2,
  Footprints
} from 'lucide-react';

interface CuratedPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
  activePersona?: string;
}

const COMMUTER_PROMPTS = [
  {
    title: 'Rute Intermoda ke TP',
    prompt: 'Bagaimana rute intermoda tercepat menuju Tunjungan Plaza dari simpul ini?',
    icon: Navigation
  },
  {
    title: 'Feeder WiraWiri Terkoneksi',
    prompt: 'Rute feeder WiraWiri dan Suroboyo Bus apa saja yang lewat di stasiun ini?',
    icon: Bus
  },
  {
    title: 'Wisata & Kuliner Jalan Kaki',
    prompt: 'Rekomendasikan tempat wisata menarik dan kuliner khas dalam jarak jalan kaki dari stasiun ini!',
    icon: Utensils
  },
  {
    title: 'Tarif & Cara Bayar Transum',
    prompt: 'Berapa tarif Suroboyo Bus dan WiraWiri? Bagaimana cara bayar dan sistem transfer gratis 2 jamnya?',
    icon: CreditCard
  },
  {
    title: 'Kenyamanan Trotoar & Suara Warga',
    prompt: 'Bagaimana hasil survei opini warga terkait kenyamanan trotoar dan angkutan umum di sekitar stasiun ini?',
    icon: MessageCircle
  },
];

const BUSINESS_PROMPTS = [
  {
    title: 'Estimasi Nilai Lahan (%ΔNJOP)',
    prompt: 'Berapa estimasi kenaikan nilai tanah (%ΔNJOP) di sekitar koridor transit ini?',
    icon: TrendingUp
  },
  {
    title: 'Retail Success Score',
    prompt: 'Bagaimana skor kelayakan Retail Success Score dan potensi usaha F&B di stasiun ini?',
    icon: Building2
  },
  {
    title: 'Foot Traffic & Malam Hari (NTL)',
    prompt: 'Analisis radiansi cahaya malam (NTL) dan kepadatan aktivitas pedestrian di sekitar stasiun ini.',
    icon: Footprints
  },
  {
    title: 'Profil Demografi & Daya Beli',
    prompt: 'Bagaimana profil demografi penduduk dan tingkat daya beli (SES) di kecamatan stasiun ini?',
    icon: BarChart
  },
];

const GOV_PROMPTS = [
  {
    title: 'Kesiapan TOD 5D',
    prompt: 'Tampilkan analisis skor TOD 5D dan dimensi terlemah yang perlu revitalisasi di simpul ini.',
    icon: BarChart
  },
  {
    title: 'Bandingkan Gubeng & Wonokromo',
    prompt: 'Bandingkan kesiapan TOD dan integrasi transit antara Stasiun Gubeng dan Stasiun Wonokromo.',
    icon: Scale
  },
  {
    title: 'Simulasi Ekstensi Feeder',
    prompt: 'Jika feeder WiraWiri diperpanjang ke simpul ini, apa dampak terhadap skor TOD-nya?',
    icon: Sliders
  },
  {
    title: 'Kesesuaian Tata Ruang (GISTARU)',
    prompt: 'Bagaimana keselarasan zona pola ruang RTRW Kota Surabaya Perda 8/2024 di sekitar stasiun ini?',
    icon: Compass
  },
];

export const CuratedPromptChips: React.FC<CuratedPromptChipsProps> = ({
  onSelectPrompt,
  disabled = false,
  activePersona = 'commuter'
}) => {
  const promptList =
    activePersona === 'commuter'
      ? COMMUTER_PROMPTS
      : activePersona === 'business'
      ? BUSINESS_PROMPTS
      : GOV_PROMPTS;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>Prompt Rekomendasi ({activePersona === 'commuter' ? 'Wisata & Komuter' : activePersona === 'business' ? 'Investasi' : 'Tata Ruang'})</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
        {promptList.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex-shrink-0 text-[11px] bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-full px-2.5 py-1 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <IconComp className="w-3 h-3 text-cyan-400" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
