'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { PersonaType } from '@/lib/persona';
import {
  HelpCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp,
  FileText, Building2, Briefcase, Train, Compass, Sparkles, MessageSquare
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona?: PersonaType;
}

// ── PERSONA-SPECIFIC FAQ ──
const PERSONA_FAQ: Record<PersonaType, Array<{ q: string; a: string }>> = {
  government: [
    {
      q: 'Apa itu TOD Score dan bagaimana cara menghitungnya?',
      a: 'TOD Score dihitung menggunakan AHP (Analytical Hierarchy Process) dengan 5 dimensi: Aksesibilitas, Kepadatan, Keberagaman, Desain, dan Demografi. Skor 0–100, di mana ≥75 = kawasan siap TOD. Detail metodologi ilmiah lengkap dapat dibaca di halaman Metodologi.',
    },
    {
      q: 'Bagaimana cara mengekspor data analisis spasial?',
      a: 'Buka Settings → Pengaturan Government → pilih Format Ekspor (GeoJSON, Shapefile, atau CSV). Tombol ekspor tersedia di panel Government setelah memilih kawasan analisis.',
    },
    {
      q: 'Apa perbedaan mode bobot AHP (Standard Expert, Kustom, Equal)?',
      a: 'Default menggunakan matriks bobot tim peneliti (CR ≤ 0.10). Kustom memungkinkan penyesuaian bobot tiap dimensi secara manual. Equal memberikan bobot merata pada seluruh dimensi.',
    },
    {
      q: 'Mengapa beberapa hexagon berwarna abu-abu di peta?',
      a: 'Hexagon abu-abu menandakan kawasan tanpa data NJOP atau data survei yang cukup. Nilai H3 tersebut dikecualikan dari analisis untuk menjaga validitas statistik.',
    },
    {
      q: 'Apa itu Spatial Durbin Model (SDM) dan mengapa digunakan?',
      a: 'SDM adalah model ekonometrika spasial yang memperhitungkan efek spillover antar kawasan tetangga. Digunakan untuk mengukur pengaruh kesiapan TOD terhadap apresiasi nilai tanah (%ΔNJOP) dengan mempertimbangkan dependensi spasial (ρ) dan efek eksternalitas (θ).',
    },
  ],
  business: [
    {
      q: 'Bagaimana cara menginterpretasi nilai %ΔNJOP?',
      a: '%ΔNJOP menunjukkan persentase estimasi kenaikan/perubahan nilai tanah (NJOP bumi) dibandingkan baseline. Nilai positif (hijau) = potensi apresiasi lahan; nilai negatif (merah) = depresiasi. Kawasan dengan %ΔNJOP >15% dikategorikan sebagai "Premium Zone".',
    },
    {
      q: 'Apa itu Retail Success Score dan bagaimana menggunakannya?',
      a: 'Retail Success Score (0–100) diprediksi menggunakan model Random Forest berdasarkan densitas pejalan kaki, mix-use index, dan aksesibilitas. Gunakan sebagai acuan pendukung keputusan investasi ritel/usaha.',
    },
    {
      q: 'Bagaimana cara menghitung potensi ROI investasi properti?',
      a: 'ROI dihitung berdasarkan proyeksi apresiasi NJOP dalam horizon waktu 5, 10, atau 15 tahun terhadap tren historis dan korelasi kedekatan simpul transit. Periode kalkulasi dapat disesuaikan di Settings → Pengaturan Business.',
    },
    {
      q: 'Apa yang dimaksud Optimal Tenant Mix?',
      a: 'Kluster spasial menganalisis distribusi penggunaan lahan eksisting di radius stasiun untuk merekomendasikan komposisi tenant ideal (misal: 40% F&B, 30% Retail, 20% Kantor, 10% Jasa).',
    },
    {
      q: 'Mengapa data NJOP saya berbeda dengan data BPS?',
      a: 'Data NJOP bersumber dari integrasi MAPID GEO API yang diagregasikan ke unit H3 Hexagonal Grid (Resolusi 8/9) untuk analisis spasial granular.',
    },
  ],
  commuter: [
    {
      q: 'Bagaimana cara membaca jadwal KRL di aplikasi ini?',
      a: 'Jadwal KRL SRRL menampilkan jam keberangkatan & stasiun tujuan. Indikator warna menunjukkan status: hijau = tepat waktu, kuning = potensi penyesuaian rute. Klik item jadwal untuk info lebih detail.',
    },
    {
      q: 'Apa itu Suroboyo Bus Feeder dan bagaimana integrasinya?',
      a: 'Feeder Bus adalah armada pengumpan (Suroboyo Bus & WiraWiri) yang menghubungkan kawasan pemukiman ke stasiun KRL terdekat. Rute pengumpan dapat diaktifkan melalui panel Layers di sidebar.',
    },
    {
      q: 'Bagaimana cara menemukan destinasi wisata dari stasiun terdekat?',
      a: 'Buka sidebar Commuter pada tab Destinasi. Tempat menarik diurutkan berdasarkan jarak dan estimasi waktu jalan kaki dari stasiun aktif.',
    },
    {
      q: 'Bagaimana cara mengaktifkan pengingat jadwal commute?',
      a: 'Buka menu Settings → Pengaturan Commuter → aktifkan toggle "Pengingat Jadwal Commute" untuk notifikasi jadwal prioritas Anda.',
    },
  ],
};

// ── PERSONA-SPECIFIC QUICK LINKS (TAB BARU) ──
const PERSONA_LINKS: Record<PersonaType, Array<{ label: string; href: string; icon: React.ReactNode }>> = {
  government: [
    { label: 'Metodologi Analisis Spasial', href: '/metodologi', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Galeri Survei Lapangan 360 Titik', href: '/survey', icon: <Compass className="w-4 h-4" /> },
    { label: 'MAPID GEO API Documentation', href: 'https://mapid.co.id', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Portal Satu Data Surabaya', href: 'https://data.surabaya.go.id', icon: <ExternalLink className="w-4 h-4" /> },
  ],
  business: [
    { label: 'Metodologi & Model SDM %ΔNJOP', href: '/metodologi', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Validasi Survei Properti & Struk Go', href: '/survey', icon: <Compass className="w-4 h-4" /> },
    { label: 'Data Katalog Spasial MAPID', href: 'https://mapid.co.id/data-catalog', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Dashboard MAPID GEO', href: 'https://mapid.co.id', icon: <ExternalLink className="w-4 h-4" /> },
  ],
  commuter: [
    { label: 'Dokumentasi Metodologi TOD', href: '/metodologi', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Galeri Titik Survei Lapangan', href: '/survey', icon: <Compass className="w-4 h-4" /> },
    { label: 'Info Rute Suroboyo Bus & WiraWiri', href: 'https://dishub.surabaya.go.id', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Jadwal Resmi KAI Commuter', href: 'https://commuterline.id', icon: <ExternalLink className="w-4 h-4" /> },
  ],
};

const PERSONA_ICON: Record<PersonaType, React.ReactNode> = {
  government: <Building2 className="w-3.5 h-3.5" />,
  business:   <Briefcase className="w-3.5 h-3.5" />,
  commuter:   <Train className="w-3.5 h-3.5" />,
};

const PERSONA_LABEL: Record<PersonaType, string> = {
  government: 'Government',
  business:   'Business',
  commuter:   'Commuter',
};

export function HelpModal({ isOpen, onClose, activePersona = 'government' }: HelpModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = PERSONA_FAQ[activePersona];
  const links = PERSONA_LINKS[activePersona];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan & Panduan"
      maxWidth="lg"
      subtitle={`Panduan penggunaan TransitERA — mode ${PERSONA_LABEL[activePersona]}`}
      icon={<HelpCircle className="w-4 h-4 text-brand-lime" />}
    >
      <div className="space-y-4">
        {/* Persona Badge */}
        <div className="px-5 pt-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            activePersona === 'government' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
            activePersona === 'business'   ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {PERSONA_ICON[activePersona]}
            Panduan disesuaikan untuk {PERSONA_LABEL[activePersona]}
          </div>
        </div>

        {/* ── HIGHLIGHTED FEATURE CARDS (Buka di Tab Baru) ── */}
        <div className="px-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Card 1: Metodologi Analisis Spasial */}
            <a
              href="/metodologi"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900/80 to-slate-900 border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    Tab Baru <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  Metodologi Analisis Spasial TransitERA
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Pelajari formulasi AHP 5D, Uber H3 Grid, dan model ekonometrika Spatial Durbin Model (%ΔNJOP).
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Buka Dokumentasi Metodologi ↗
              </div>
            </a>

            {/* Card 2: Galeri Survei Lapangan */}
            <a
              href="/survey"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900/80 to-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 transition-all shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    Tab Baru <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Galeri & Data Survei #PakSibukGa
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Rekapitulasi 360 titik survei primer MAPID Apps di 5 simpul stasiun SRRL Surabaya.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Buka Galeri Survei ↗
              </div>
            </a>
          </div>
        </div>

        {/* ── EXTERNAL RESOURCES & LINKS ── */}
        <div className="px-5 py-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Tautan & Referensi Terkait (Buka di Tab Baru)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 hover:text-brand-lime hover:border-brand-lime/30 hover:bg-slate-800/70 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-500 group-hover:text-brand-lime transition-colors flex-shrink-0">
                    {link.icon}
                  </span>
                  <span className="font-medium leading-tight truncate">{link.label}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-lime flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* ── FAQ ACCORDION ── */}
        <div className="px-5 py-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Frequently Asked Questions (FAQ) — {PERSONA_LABEL[activePersona]}
          </p>
          <div className="space-y-2">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border transition-colors overflow-hidden ${
                  openFaq === idx
                    ? 'border-brand-lime/30 bg-brand-lime/5'
                    : 'border-slate-700/60 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <p className="text-xs font-medium text-slate-200 leading-snug">{item.q}</p>
                  <span className="flex-shrink-0 text-slate-500 mt-0.5">
                    {openFaq === idx ? <ChevronUp className="w-3.5 h-3.5 text-brand-lime" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-3 border-t border-slate-800/50 pt-2.5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <MessageSquare className="w-5 h-5 text-brand-lime/70 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300">Butuh bantuan teknis lebih lanjut?</p>
              <p className="text-[11px] text-slate-500">
                Hubungi tim pengembang TransitERA di{' '}
                <a href="mailto:hello@transitera.id" className="text-brand-lime hover:underline">
                  hello@transitera.id
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
