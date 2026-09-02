'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PersonaType } from '@/lib/persona';
import {
  User, LogOut, ChevronRight, Building2, Briefcase, Train,
  Shield, MapPin, Mail, Edit3,
} from 'lucide-react';

const DUMMY_USER = {
  name: 'Pak Sibuk',
  email: 'admin@transitera.id',
  role: 'Peneliti Spasial',
  institution: 'TransitERA Team',
  location: 'Surabaya, Jawa Timur',
  avatar: 'PS',
};

const PERSONA_OPTIONS: { id: PersonaType; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'government', label: 'Government', description: 'Analisis kebijakan TOD', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'business',   label: 'Business',   description: 'Investasi properti & NJOP', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'commuter',   label: 'Commuter',   description: 'Jadwal & rute transit', icon: <Train className="w-3.5 h-3.5" /> },
];

// Persona-specific stats
const PERSONA_STATS: Record<PersonaType, Array<{ label: string; value: string }>> = {
  government: [
    { label: 'Laporan', value: '12' },
    { label: 'Kawasan', value: '34' },
    { label: 'Kebijakan', value: '5' },
  ],
  business: [
    { label: 'Properti', value: '87' },
    { label: 'Analisis', value: '23' },
    { label: 'ROI Sim.', value: '9' },
  ],
  commuter: [
    { label: 'Rute', value: '6' },
    { label: 'Commutes', value: '128' },
    { label: 'Favorit', value: '4' },
  ],
};

// Persona-specific quick actions in menu
const PERSONA_ACTIONS: Record<PersonaType, Array<{ label: string; description: string; icon: React.ReactNode }>> = {
  government: [
    { label: 'Ekspor Laporan TOD', description: 'GeoJSON / Shapefile / CSV', icon: <Building2 className="w-3 h-3" /> },
    { label: 'Atur Bobot AHP',     description: 'Sesuaikan kriteria analisis',  icon: <Building2 className="w-3 h-3" /> },
  ],
  business: [
    { label: 'Watchlist Kawasan', description: 'Pantau zona investasi favorit', icon: <Briefcase className="w-3 h-3" /> },
    { label: 'Bandingkan ROI',    description: 'Komparasi antar stasiun',        icon: <Briefcase className="w-3 h-3" /> },
  ],
  commuter: [
    { label: 'Stasiun Favorit',  description: 'Simpan rute harian',            icon: <Train className="w-3 h-3" /> },
    { label: 'Cek Jadwal Live',  description: 'Status real-time KRL',          icon: <Train className="w-3 h-3" /> },
  ],
};

interface ProfileDropdownProps {
  activePersona?: PersonaType;
  onChangePersona?: (persona: PersonaType) => void;
}

export function ProfileDropdown({ activePersona = 'government', onChangePersona }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const stats = PERSONA_STATS[activePersona];
  const actions = PERSONA_ACTIONS[activePersona];

  const personaColor = {
    government: 'from-blue-600 to-blue-500',
    business:   'from-purple-600 to-purple-500',
    commuter:   'from-emerald-600 to-emerald-500',
  }[activePersona];

  const badgeColor = {
    government: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    business:   'bg-purple-500/10 border-purple-500/30 text-purple-400',
    commuter:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  }[activePersona];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${personaColor} flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 transition-all`}>
        {DUMMY_USER.avatar}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-700/60 shadow-2xl z-50 overflow-hidden"
          style={{ background: 'rgba(10,15,29,0.97)', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,124,0,0.08)', animation: 'dropIn 0.15s ease-out' }}>
          
          {/* Profile Card */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${personaColor} flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
                {DUMMY_USER.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-100 truncate">{DUMMY_USER.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{DUMMY_USER.role}</p>
                <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${badgeColor}`}>
                  <Shield className="w-2.5 h-2.5" />
                  {activePersona.charAt(0).toUpperCase() + activePersona.slice(1)} Mode
                </div>
              </div>
              <button className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{DUMMY_USER.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{DUMMY_USER.institution}</span>
              </div>
            </div>
          </div>

          {/* Persona-specific Stats */}
          <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-slate-800">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <p className="text-sm font-bold text-slate-200 tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Persona Selector */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ganti Persona</p>
            <div className="space-y-1">
              {PERSONA_OPTIONS.map((p) => (
                <button key={p.id} onClick={() => { onChangePersona?.(p.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    activePersona === p.id
                      ? `${badgeColor} bg-opacity-10`
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}>
                  <span className={activePersona === p.id ? '' : 'text-slate-500'}>{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-none">{p.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                  {activePersona === p.id && <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Quick Actions */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Aksi Cepat</p>
            <div className="space-y-1">
              {actions.map((action) => (
                <button key={action.label}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
                  <span className="text-left">
                    <span className="block font-medium">{action.label}</span>
                    <span className="text-[10px] text-slate-600">{action.description}</span>
                  </span>
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="px-4 py-3">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <span className="flex items-center gap-2"><LogOut className="w-3.5 h-3.5" />Keluar</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
