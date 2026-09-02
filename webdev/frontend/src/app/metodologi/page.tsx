'use client';

import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/ui/HeaderNav';
import {
  Layers,
  Cpu,
  Database,
  ArrowLeft,
  CheckCircle,
  Award,
  BookOpen
} from 'lucide-react';

export default function MetodologiPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <HeaderNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Peta WebGIS
        </Link>

        {/* Title Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            Dokumentasi Ilmiah & Metodologi
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Metodologi Analisis Spasial TransitERA
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Kerangka pemodelan kuantitatif kesiapan Transit-Oriented Development (TOD) berbasis Uber H3 Grid, Analytical Hierarchy Process (AHP), dan Spatial Durbin Model (SDM).
          </p>
        </div>

        {/* 1. Agregasi H3 Hexagonal Grid */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            1. Agregasi Partisi Spasial H3 Hexagonal Grid (Resolusi 8 & 9)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Berbeda dari metode radius lingkaran konvensional yang bias terhadap distorsi jarak dan tumpang tindih area, sistem menggunakan sel heksagon Uber H3:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Resolusi 8 (~0,737 km²):</strong> Analisis makro tingkat koridor stasiun SRRL.</li>
            <li><strong>Resolusi 9 (~0,105 km², sisi ~174m):</strong> Analisis mikro catchment area pejalan kaki, proksi transaksi Struk Go, dan estimasi nilai tanah lokal.</li>
          </ul>
        </section>

        {/* 2. Kerangka 5 Dimensi TOD (AHP Scoring) */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            2. Kerangka 5D TOD & Validasi Konsistensi AHP (CR ≤ 0,10)
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-300">D1: Density</span>
              <p className="text-slate-400 mt-0.5">Kepadatan penduduk (SES MAPID) & intensitas bangunan.</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-300">D2: Diversity</span>
              <p className="text-slate-400 mt-0.5">Percampuran guna lahan komersial & variasi harga menu (Menu Go).</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-300">D3: Design</span>
              <p className="text-slate-400 mt-0.5">Kualitas trotoar pedestrian, tactile paving, & peneduh (Activity Data).</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-300">D4: Destination Accessibility</span>
              <p className="text-slate-400 mt-0.5">Aksesibilitas ke POI penting (sekolah, pasar, kantor) dalam 15 menit.</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 sm:col-span-2">
              <span className="font-bold text-cyan-300">D5: Distance to Transit</span>
              <p className="text-slate-400 mt-0.5">Jarak jaringan aktual (OSMnx network) ke stasiun SRRL & halte feeder WiraWiri.</p>
            </div>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Matriks perbandingan berpasangan panel ahli diverifikasi memiliki rasio konsistensi <strong>Saaty Consistency Ratio (CR) = 0,042 ≤ 0,10</strong> (Valid & Konsisten).</span>
          </div>
        </section>

        {/* 3. Spatial Durbin Model (%ΔNJOP) */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            3. Ekonometrika Spasial: Spatial Durbin Model (SDM)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Model regresi spasial mengestimasi keterkaitan skor kesiapan TOD ($X$) terhadap nilai tanah/NJOP bumi per m² ($Y$) dengan memperhitungkan ketergantungan spasial antar kawasan tetangga:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg tabular-nums text-xs text-cyan-300 text-center border border-slate-800">
            Y = ρWY + α + Xβ + WXθ + ε
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Menghasilkan estimasi dampak langsung (<em>direct effect</em>), dampak limpahan (<em>spatial spillover</em>), dan interval kepercayaan 95% untuk kalkulasi risiko investasi lahan.
          </p>
        </section>

        {/* 4. Tim Pengembang */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-teal" />
            Disusun Oleh Tim TransitERA
          </h2>
          <p className="text-xs text-slate-400">
            MAPID WebGIS Competition #2 - 2026 (Maps That Think! - Mass Transportation Edition).
          </p>
        </section>
      </main>
    </div>
  );
}
