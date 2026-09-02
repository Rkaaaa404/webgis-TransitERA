'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PersonaType } from '@/lib/persona';
import {
  HelpCircle, MessageSquare, BookOpen, ExternalLink, ChevronDown, ChevronUp,
  Star, Send, CheckCircle2, Bug, Lightbulb, FileText,
  Building2, Briefcase, Train,
} from 'lucide-react';

interface HelpFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona?: PersonaType;
}

// ── PERSONA-SPECIFIC FAQ ──
const PERSONA_FAQ: Record<PersonaType, Array<{ q: string; a: string }>> = {
  government: [
    {
      q: 'Apa itu TOD Score dan bagaimana cara menghitungnya?',
      a: 'TOD Score dihitung menggunakan AHP (Analytical Hierarchy Process) dengan 5 dimensi: Aksesibilitas, Kepadatan, Keberagaman, Desain, dan Demografi. Skor 0–100, di mana ≥75 = kawasan siap TOD. Detail metodologi tersedia di halaman Metodologi.',
    },
    {
      q: 'Bagaimana cara mengekspor data analisis spasial?',
      a: 'Buka Settings → Preferensi Government → pilih Format Ekspor (GeoJSON, Shapefile, atau CSV). Tombol ekspor tersedia di panel Government setelah memilih kawasan analisis.',
    },
    {
      q: 'Apa perbedaan mode bobot AHP (Standard Expert, Kustom, Equal)?',
      a: 'Default menggunakan bobot yang ditetapkan tim peneliti (CR ≤ 0.10). Kustom memungkinkan penyesuaian bobot tiap dimensi secara manual. Equal memberikan bobot merata pada semua dimensi.',
    },
    {
      q: 'Mengapa beberapa hexagon berwarna abu-abu di peta?',
      a: 'Hexagon abu-abu menandakan kawasan tanpa data NJOP atau data survei yang cukup. Nilai H3 tersebut dikecualikan dari analisis untuk menjaga validitas statistik.',
    },
    {
      q: 'Apa itu Spatial Durbin Model (SDM) dan mengapa digunakan?',
      a: 'SDM adalah model regresi spasial yang memperhitungkan efek spillover antar kawasan tetangga. Digunakan untuk mengukur pengaruh skor TOD terhadap NJOP bumi dengan mempertimbangkan dependensi spasial (ρ) dan efek eksternalitas (θ).',
    },
  ],
  business: [
    {
      q: 'Bagaimana cara menginterpretasi nilai %ΔNJOP?',
      a: '%ΔNJOP menunjukkan persentase perubahan nilai tanah (NJOP bumi) dibandingkan tahun sebelumnya. Nilai positif (hijau) = apresiasi lahan; nilai negatif (merah) = depresiasi. Zona dengan %ΔNJOP >15% dikategorikan sebagai "Premium Zone".',
    },
    {
      q: 'Apa itu Retail Success Score dan bagaimana menggunakannya?',
      a: 'Retail Success Score (0–100) diprediksi menggunakan model Random Forest berdasarkan densitas pejalan kaki, mix-use index, dan aksesibilitas. Gunakan sebagai salah satu input keputusan investasi, bukan satu-satunya faktor.',
    },
    {
      q: 'Bagaimana cara menghitung potensi ROI investasi properti?',
      a: 'ROI dihitung berdasarkan: (NJOP Proyeksi - NJOP Saat Ini) / NJOP Saat Ini × 100%. Proyeksi menggunakan tren historis + korelasi dengan kenaikan skor TOD. Atur periode kalkulasi (5/10/15 tahun) di Settings → Business.',
    },
    {
      q: 'Apa yang dimaksud Optimal Tenant Mix?',
      a: 'Kluster DBSCAN menganalisis distribusi penggunaan lahan eksisting di radius 1km dari stasiun untuk merekomendasikan komposisi tenant ideal (contoh: 40% F&B, 30% Retail, 20% Kantor, 10% Jasa).',
    },
    {
      q: 'Mengapa data NJOP saya berbeda dengan data BPS?',
      a: 'Data NJOP bersumber dari MAPID GEO API yang diperbarui berkala. Perbedaan dengan BPS dapat terjadi akibat perbedaan tahun data, metodologi zonasi, atau lag pembaruan data daerah.',
    },
  ],
  commuter: [
    {
      q: 'Bagaimana cara membaca jadwal KRL di aplikasi ini?',
      a: 'Jadwal KRL SRRL ditampilkan dalam format HH:MM (jam keberangkatan → jam kedatangan). Ikon warna menunjukkan status: hijau = tepat waktu, kuning = terlambat, abu-abu = sudah berangkat. Klik jadwal untuk detail rute dan stasiun transit.',
    },
    {
      q: 'Apa itu Suroboyo Bus Feeder dan bagaimana menggunakannya?',
      a: 'Feeder Bus adalah armada pengumpan (Suroboyo Bus) yang menghubungkan kawasan sekitar ke stasiun KRL terdekat. Pilih rute SB-01 hingga SB-05 di sidebar Commuter untuk melihat halte dan estimasi waktu tempuh.',
    },
    {
      q: 'Apakah data jadwal KRL sudah real-time?',
      a: 'Saat ini data jadwal bersifat statis berdasarkan jadwal resmi PT KCI. Integrasi API real-time sedang dalam pengembangan Phase 5. Untuk info keterlambatan aktual, cek notifikasi di ikon lonceng.',
    },
    {
      q: 'Bagaimana cara menemukan destinasi wisata dari stasiun terdekat?',
      a: 'Buka tab Commuter → Tourist Destinations. Daftar destinasi wisata diurutkan berdasarkan jarak jalan kaki dari stasiun yang dipilih. Klik destinasi untuk melihat rating, kategori, dan jarak tempuh.',
    },
    {
      q: 'Bagaimana cara mengaktifkan pengingat jadwal commute?',
      a: 'Buka Settings → Preferensi Commuter → aktifkan toggle "Pengingat Jadwal Commute". Notifikasi akan muncul 15 menit sebelum jadwal keberangkatan yang kamu atur sebagai favorit.',
    },
  ],
};

// ── PERSONA-SPECIFIC QUICK LINKS ──
const PERSONA_LINKS: Record<PersonaType, Array<{ label: string; href: string; icon: React.ReactNode }>> = {
  government: [
    { label: 'Halaman Metodologi', href: '/metodologi', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Dokumen AHP Weights', href: '#', icon: <FileText className="w-4 h-4" /> },
    { label: 'Regulasi TOD Nasional', href: '#', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Data NJOP Open BPS', href: '#', icon: <ExternalLink className="w-4 h-4" /> },
  ],
  business: [
    { label: 'Panduan Analisis NJOP', href: '#', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Model Random Forest', href: '/metodologi', icon: <FileText className="w-4 h-4" /> },
    { label: 'MAPID GEO API Docs', href: 'https://mapid.co.id', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Data Properti Open', href: '#', icon: <ExternalLink className="w-4 h-4" /> },
  ],
  commuter: [
    { label: 'Jadwal KRL Resmi PT KCI', href: '#', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Peta Rute Suroboyo Bus', href: '#', icon: <FileText className="w-4 h-4" /> },
    { label: 'Info Wisata Surabaya', href: '#', icon: <ExternalLink className="w-4 h-4" /> },
    { label: 'Aplikasi KAI Access', href: '#', icon: <ExternalLink className="w-4 h-4" /> },
  ],
};

const PERSONA_ICON: Record<PersonaType, React.ReactNode> = {
  government: <Building2 className="w-4 h-4" />,
  business:   <Briefcase className="w-4 h-4" />,
  commuter:   <Train className="w-4 h-4" />,
};

const PERSONA_LABEL: Record<PersonaType, string> = {
  government: 'Government',
  business:   'Business',
  commuter:   'Commuter',
};

type FeedbackCategory = 'bug' | 'feature' | 'data' | 'general';

const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'bug',     label: 'Laporan Bug',  icon: <Bug className="w-3.5 h-3.5" /> },
  { value: 'feature', label: 'Saran Fitur',  icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { value: 'data',    label: 'Koreksi Data', icon: <FileText className="w-3.5 h-3.5" /> },
  { value: 'general', label: 'Umum',         icon: <Star className="w-3.5 h-3.5" /> },
];

export function HelpFeedbackModal({ isOpen, onClose, activePersona = 'government' }: HelpFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'help' | 'feedback'>('help');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setFeedbackEmail('');
      setRating(0);
      setFeedbackCategory('general');
      onClose();
    }, 2000);
  };

  const faqs = PERSONA_FAQ[activePersona];
  const links = PERSONA_LINKS[activePersona];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bantuan & Umpan Balik" maxWidth="lg"
      subtitle={`Panduan penggunaan TransitERA — mode ${PERSONA_LABEL[activePersona]}`}
      icon={<HelpCircle className="w-4 h-4" />}>

      {/* Persona Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          activePersona === 'government' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
          activePersona === 'business'   ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {PERSONA_ICON[activePersona]}
          Konten disesuaikan untuk {PERSONA_LABEL[activePersona]}
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex border-b border-slate-800 px-5">
        {[
          { id: 'help', label: 'Bantuan', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as 'help' | 'feedback')}
            className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-brand-lime text-brand-lime'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── HELP TAB ── */}
      {activeTab === 'help' && (
        <div>
          {/* Quick Links */}
          <div className="px-5 py-4 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Sumber Daya {PERSONA_LABEL[activePersona]}</p>
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <a key={link.label} href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 hover:text-brand-lime hover:border-brand-lime/30 hover:bg-slate-800/70 transition-all group">
                  <span className="text-slate-600 group-hover:text-brand-lime transition-colors">{link.icon}</span>
                  <span className="font-medium leading-tight">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">FAQ — {PERSONA_LABEL[activePersona]}</p>
            <div className="space-y-2">
              {faqs.map((item, idx) => (
                <div key={idx} className={`rounded-xl border transition-colors overflow-hidden ${
                  openFaq === idx
                    ? 'border-brand-lime/30 bg-brand-lime/5'
                    : 'border-slate-700/60 bg-slate-800/30 hover:border-slate-600'
                }`}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left">
                    <p className="text-xs font-medium text-slate-200 leading-snug">{item.q}</p>
                    <span className="flex-shrink-0 text-slate-500 mt-0.5">
                      {openFaq === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-3">
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <MessageSquare className="w-5 h-5 text-brand-lime/70 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-300">Butuh bantuan lebih lanjut?</p>
                <p className="text-[11px] text-slate-500">
                  Hubungi tim TransitERA di{' '}
                  <a href="mailto:hello@transitera.id" className="text-brand-lime hover:underline">hello@transitera.id</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK TAB ── */}
      {activeTab === 'feedback' && (
        <div className="px-5 py-4">
          {submitted ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-100">Terima Kasih!</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Masukan Anda dari perspektif {PERSONA_LABEL[activePersona]} sangat berarti untuk pengembangan TransitERA.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Kategori</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <button key={cat.value} onClick={() => setFeedbackCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        feedbackCategory === cat.value
                          ? 'bg-brand-lime/15 border-brand-lime/40 text-brand-lime'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                      }`}>
                      <span className={feedbackCategory === cat.value ? 'text-brand-lime' : 'text-slate-600'}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Rating Pengalaman</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)}
                      className={`transition-transform hover:scale-110 ${star <= rating ? 'text-brand-teal' : 'text-slate-700 hover:text-slate-500'}`}>
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    {rating === 0 ? 'Pilih rating' : ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][rating]}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pesan Anda *</label>
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={`Ceritakan pengalaman Anda sebagai pengguna ${PERSONA_LABEL[activePersona]}...`}
                  rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email (Opsional)</label>
                <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="email@contoh.com (untuk respons balik)"
                  className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all" />
              </div>

              <button onClick={handleSubmitFeedback} disabled={!feedbackText.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  feedbackText.trim()
                    ? 'bg-brand-lime hover:bg-[#8CE0C4] text-white shadow-lg shadow-brand-lime/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}>
                <Send className="w-4 h-4" />
                Kirim sebagai {PERSONA_LABEL[activePersona]}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
