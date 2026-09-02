'use client';

import React from 'react';
import { Clock, Footprints, TrainFront, Car } from 'lucide-react';

import { TravelEstimateItem } from '@/types';

interface TravelEstimatorProps {
  estimates?: TravelEstimateItem[];
}

export const TravelEstimator: React.FC<TravelEstimatorProps> = ({ estimates = [] }) => {
  const data = estimates.length > 0 ? estimates : [
    { 
      destination: 'Tugu Pahlawan', 
      time: '12 min', 
      icon: 'walk',
      steps: [
        { mode: 'Walk', desc: 'Jalan kaki ke halte', time: '3 min' },
        { mode: 'WiraWiri', desc: 'Naik Feeder WiraWiri FD3', time: '9 min' }
      ]
    },
    { 
      destination: 'Alun-Alun Sidoarjo', 
      time: '35 min', 
      icon: 'train',
      steps: [
        { mode: 'Walk', desc: 'Jalan kaki ke Peron 1', time: '2 min' },
        { mode: 'Train', desc: 'KRL Commuter Line Supas', time: '28 min' },
        { mode: 'Walk', desc: 'Jalan kaki ke alun-alun', time: '5 min' }
      ]
    },
  ];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'walk':
      case '🚶': return <Footprints className="w-3 h-3" />;
      case 'train':
      case '🚆': return <TrainFront className="w-3 h-3" />;
      case 'car':
      case '🚗': return <Car className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-bold text-slate-200">Navigasi Step-by-Step</h4>
      </div>
      
      <div className="space-y-3">
        {data.map((est, idx) => (
          <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="flex justify-between items-center text-[11px] mb-2 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-slate-200 text-xs">{est.destination}</span>
              <span className="font-bold text-brand-lime bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1.5">
                <span>{renderIcon(est.icon || '')}</span> {est.time}
              </span>
            </div>
            {/* Step by step */}
            {(est as any).steps && (
              <div className="space-y-1.5 mt-2 relative before:absolute before:inset-y-1 before:left-[7px] before:w-px before:bg-slate-700">
                {(est as any).steps.map((step: any, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-2.5 relative">
                    <div className="w-[15px] h-[15px] rounded-full bg-slate-800 border-2 border-brand-teal flex-shrink-0 z-10 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-300">{step.desc}</div>
                      <div className="text-[9px] text-slate-500 font-medium mt-0.5">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
