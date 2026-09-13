import { BasemapStyleKey } from '@/components/map/LayerControl';

/**
 * Persona types matching the 3 user segments from PRD.
 * Each persona gets a distinct dashboard experience.
 */
export type PersonaType = 'government' | 'business' | 'commuter';

export interface PersonaConfig {
  id: PersonaType;
  label: string;
  sublabel: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  defaultBasemap: BasemapStyleKey;
  footerDataSource: string;
  analyticsTitle: string;
  analyticsSubtitle: string;
}

export const PERSONA_CONFIGS: Record<PersonaType, PersonaConfig> = {
  government: {
    id: 'government',
    label: 'Government',
    sublabel: 'Perencana Kota',
    sidebarTitle: 'KAI-STATION HUB',
    sidebarSubtitle: 'Decision Support',
    defaultBasemap: 'street',
    footerDataSource: 'KAI-STATION HUB',
    analyticsTitle: 'Analytical Insights',
    analyticsSubtitle: 'Real-Time Spatial Advisor',
  },
  business: {
    id: 'business',
    label: 'Business',
    sublabel: 'Investor & UMKM',
    sidebarTitle: 'Layers & Filters',
    sidebarSubtitle: 'Configure spatial view',
    defaultBasemap: 'street',
    footerDataSource: 'Properti Go, Struk Go, Menu Go',
    analyticsTitle: 'Investor Advisory',
    analyticsSubtitle: 'Stasiun Gubeng Sector',
  },
  commuter: {
    id: 'commuter',
    label: 'Masyarakat Umum',
    sublabel: 'Komuter & Warga',
    sidebarTitle: 'Transit Navigator',
    sidebarSubtitle: 'Rute & Jadwal',
    defaultBasemap: 'street',
    footerDataSource: 'Menu Go, Suroboyo Bus, KAI',
    analyticsTitle: 'Analytical Insights',
    analyticsSubtitle: 'Commuter Companion',
  },
};

export function getPersonaConfig(persona: PersonaType): PersonaConfig {
  return PERSONA_CONFIGS[persona];
}
