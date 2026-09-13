'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StationId } from '@/types';
import { PersonaType } from '@/lib/persona';
import { FALLBACK_STATIONS } from '@/lib/api';
import { Train, Settings, ChevronDown, Search, HelpCircle, Menu } from 'lucide-react';

import { NotificationDropdown } from '@/components/header/NotificationDropdown';
import { ProfileDropdown } from '@/components/header/ProfileDropdown';

interface HeaderNavProps {
  activeStation?: StationId;
  onSelectStation?: (stationId: StationId) => void;
  activePersona?: PersonaType;
  onChangePersona?: (persona: PersonaType) => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onToggleSidebar?: () => void;
}

const PERSONA_TABS: { id: PersonaType; label: string }[] = [
  { id: 'government', label: 'Government' },
  { id: 'business', label: 'Business' },
  { id: 'commuter', label: 'Commuter' },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeStation = 'gubeng',
  onSelectStation,
  activePersona = 'government',
  onChangePersona,
  onOpenSettings,
  onOpenHelp,
}) => {
  return (
    <>
      <header className="glass-header sticky top-0 z-40 w-full px-2 md:px-4 py-2 flex items-center justify-between shadow-lg gap-2">
        {/* ── Brand / Logo ── */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              alt="TransitERA Logo"
              className="h-7 md:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              src="/assets/landing/LOGO.png"
              width={32}
              height={32}
              style={{ width: 'auto' }}
              priority
            />

            <div className="hidden sm:block">
              <span className="font-bold text-lg tracking-tight text-white">
                Transit<span className="text-brand-lime">ERA</span>
              </span>
            </div>
          </Link>
        </div>

        {/* ── Persona Tabs (Center) ── */}
        <nav className="flex-1 min-w-0 flex items-center gap-0.5 overflow-x-auto scrollbar-hide whitespace-nowrap px-2 touch-pan-x">
          {PERSONA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangePersona?.(tab.id)}
              className={`px-1.5 md:px-4 py-1.5 text-[10px] md:text-sm font-semibold transition-all relative shrink-0 ${
                activePersona === tab.id
                  ? 'text-brand-lime'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {activePersona === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 md:w-8 h-0.5 bg-brand-lime rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search (desktop) */}
          <div className="hidden lg:flex items-center bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-1.5 gap-2 w-44 focus-within:border-brand-lime/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search area..."
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Station Selector */}
          {onSelectStation && (
            <div className="relative">
              <select
                value={activeStation}
                onChange={(e) => onSelectStation(e.target.value as StationId)}
                className="max-w-[110px] sm:max-w-[170px] md:max-w-none text-ellipsis overflow-hidden whitespace-nowrap appearance-none bg-slate-900/70 hover:bg-slate-800 text-slate-200 text-[10px] md:text-xs font-semibold py-1.5 pl-2 pr-6 md:pl-3 md:pr-7 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-lime/50 cursor-pointer transition-colors"
              >
                <optgroup label="Focus Area" className="bg-slate-950 font-bold text-brand-lime">
                  {FALLBACK_STATIONS.filter((s) => s.is_tier_1).map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100 font-medium">
                      {s.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')} ({s.tod_readiness_score})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Surabaya Rail Network" className="bg-slate-950 font-bold text-slate-400">
                  {FALLBACK_STATIONS.filter((s) => !s.is_tier_1).map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-300 font-normal">
                      {s.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')} ({s.tod_readiness_score})
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Notification Bell (with dropdown) */}
          <NotificationDropdown activePersona={activePersona} />

          {/* Help */}
          <button
            onClick={() => onOpenHelp ? onOpenHelp() : undefined}
            className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Bantuan & Feedback"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => onOpenSettings ? onOpenSettings() : undefined}
            className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile (with dropdown) */}
          <ProfileDropdown activePersona={activePersona} onChangePersona={onChangePersona} />
        </div>
      </header>

    </>
  );
};

