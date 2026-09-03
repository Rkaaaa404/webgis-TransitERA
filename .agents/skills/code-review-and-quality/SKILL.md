---
name: code-review-and-quality
description: "Multi-axis code review for TransitERA WebGIS. Covers five-axis review (correctness, readability, architecture, security, performance), TypeScript strict mode, Python type hints, change sizing, structural remedies, and quality gates before merge."
---

# Code Review and Quality (TransitERA)

Panduan review kode multi-dimensi untuk **TransitERA WebGIS** — mengadaptasi prinsip dari [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) ke konteks **TypeScript (Next.js) + Python (FastAPI)**.

---

## 1. Standar Approval

> **Approve perubahan yang pasti meningkatkan code health keseluruhan**, meskipun belum sempurna. Kode sempurna tidak ada — tujuannya adalah perbaikan berkelanjutan. Jangan blokir perubahan karena bukan cara Anda menulisnya.

---

## 2. Five-Axis Review

Setiap review mengevaluasi kode di 5 dimensi:

### Axis 1: Correctness

- Apakah kode sesuai dengan spec/task requirements?
- Apakah edge cases ditangani (null, empty, boundary values)?
- Apakah error paths ditangani (bukan hanya happy path)?
- Apakah semua tests lulus? Apakah tests menguji hal yang benar?
- **TransitERA specific:**
  - Apakah koordinat divalidasi terhadap Surabaya bounding box?
  - Apakah AHP CR ≤ 0.10?
  - Apakah H3 resolution konsisten (8 atau 9)?

### Axis 2: Readability & Simplicity

- Apakah nama deskriptif dan konsisten? (Tidak ada `temp`, `data`, `result` tanpa konteks)
- Apakah control flow straightforward?
- **Bisa dikerjakan dalam lebih sedikit baris?** (1000 baris di mana 100 cukup = failure)
- Apakah ada dead code artifacts?
- **TransitERA specific:**
  - Apakah komponen React fokus pada satu tugas?
  - Apakah Pydantic models jelas mendokumentasikan schema?
  - Apakah UI bebas dari emoji mentah? (Wajib gunakan Lucide Icons, shadcn/ui, atau Mantine UI daripada emoji Unicode).

### Axis 3: Architecture

- Apakah mengikuti pola existing atau memperkenalkan yang baru? Jika baru, apakah justified?
- Apakah module boundaries bersih?
- Apakah ada code duplication yang harus di-share?
- **TransitERA specific:**
  - Apakah data fetching terpisah dari presentasi?
  - Apakah AI logic di backend (bukan frontend)?
  - Apakah spatial queries di PostGIS (bukan client-side)?

### Axis 4: Security

- Apakah user input divalidasi?
- Apakah secrets tidak di code/log/version control?
- Apakah SQL queries parameterized?
- **TransitERA specific:**
  - Apakah API keys hanya di `.env` backend?
  - Apakah Gemini responses divalidasi sebelum render?
  - Apakah bounding box guardrail aktif?

### Axis 5: Performance

- Apakah ada N+1 query patterns?
- Apakah ada unbounded data fetching?
- Apakah ada re-render berlebihan di komponen UI?
- **TransitERA specific:**
  - Apakah H3 data di-load viewport-based?
  - Apakah komponen berat (RadarChart) di-lazy load?
  - Apakah pre-computed scores di-cache di Redis?

---

## 3. Change Sizing

```
~100 lines changed   → Baik. Reviewable dalam satu sesi.
~300 lines changed   → Acceptable jika single logical change.
~1000 lines changed  → Terlalu besar. Split.
```

**Pisahkan refactoring dari feature work.** Perubahan yang refactor kode existing DAN menambah behavior baru = dua perubahan — submit terpisah.

---

## 4. Structural Remedies

Ketika menemukan masalah struktural, usulkan solusi — bukan hanya masalah:

- **Replace chain of conditionals** → typed model atau explicit dispatcher
- **Collapse duplicate branches** → single clearer flow
- **Separate orchestration dari business logic** agar masing-masing readable
- **Move feature-specific logic** keluar dari shared module ke package yang memiliki konsep tersebut
- **Reuse canonical helper** daripada near-duplicate bespoke
- **Extract helper, atau split large file** ke focused modules

---

## 5. Type Safety Standards

### TypeScript (Frontend)

```typescript
// ✅ Baik: Strict types
interface StationTODData {
  stationId: string;
  stationName: string;
  todReadinessScore: number;
  dimensions: {
    density: number;
    diversity: number;
    design: number;
    destinationAccessibility: number;
    distanceToTransit: number;
  };
  typology: 'commercial_transit_hub' | 'mixed_use_residential' | 'low_accessibility_feeder';
}

// ❌ Buruk: any types
const data: any = await fetchData();
```

### Python (Backend)

```python
# ✅ Baik: Type hints + Pydantic
from pydantic import BaseModel

class TODScore(BaseModel):
    station_id: str
    tod_readiness_score: float
    density: float
    diversity: float
    design: float
    destination_accessibility: float
    distance_to_transit: float

async def get_tod_score(station_id: str) -> TODScore:
    ...

# ❌ Buruk: No type hints
def get_data(id):
    ...
```

---

## 6. Change Descriptions

Setiap commit/PR memerlukan deskripsi yang berdiri sendiri:

**Baris pertama:** Pendek, imperatif, standalone.
- ✅ "Add H3 choropleth layer with TOD score color ramp"
- ✅ "Fix AHP weight calculation for 5D matrix"
- ❌ "Fix bug"
- ❌ "Update files"
- ❌ "WIP"

**Body:** Apa yang berubah dan mengapa. Sertakan konteks, keputusan, dan reasoning.
