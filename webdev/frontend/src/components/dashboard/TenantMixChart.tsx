'use client';

import React from 'react';

import { TenantMixItem } from '@/types';

interface TenantMixChartProps {
  data?: TenantMixItem[];
}

const DEFAULT_TENANT_MIX: TenantMixItem[] = [
  { label: 'F&B', value: 48, color: 'bg-brand-lime' },
  { label: 'Retail', value: 36, color: 'bg-amber-500' },
  { label: 'Services', value: 28, color: 'bg-emerald-500' },
  { label: 'UMKM (Micro)', value: 18, color: 'bg-cyan-500' },
];

export const TenantMixChart: React.FC<TenantMixChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : DEFAULT_TENANT_MIX;
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200">Optimal Tenant Mix</h4>
        <span className="text-[9px] tabular-nums text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
          DBSCAN
        </span>
      </div>

      <div className="space-y-2">
        {chartData.map((item) => (
          <div key={item.label} className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-bold text-slate-200">{item.value}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

