---
name: security-audit-compliance
description: "Comprehensive security hardening and competition rubric audit for TransitERA WebGIS. Covers API key isolation, OWASP top 10 prevention, input validation, MAPID 2026 rubric compliance (8 modul PRD, Coaching 1/2/3), and automated security scanning scripts."
---

# Security, Audit & Compliance (TransitERA)

Security hardening, code audit protocols, and competition rubric compliance guidelines for **TransitERA WebGIS**.

---

## 1. Core Security Invariants (Three-Tier Boundary)

### Mandatory Requirements (Zero Exceptions):
- **API Key Isolation**: `GEMINI_API_KEY` and `MAPID_API_KEY` reside exclusively in backend environment variables. Never bundle private keys into client JavaScript.
- **SQL Parameterization**: Parameterize all PostGIS queries via SQLAlchemy or parameterized drivers; never concatenate user strings into SQL clauses.
- **Strict Boundary Validation**: Validate all incoming payloads at FastAPI endpoints using Pydantic schemas.
- **Surabaya Bounding Box Guardrail**: Reject or clamp any coordinates outside Surabaya city limits (`[112.55, -7.38]` to `[112.85, -7.18]`).
- **No Secret Commits**: Pass `python scripts/scan_secrets.py` on all PRs and commits before push.

### Strict Prohibitions:
- Never commit `.env` files or hardcoded credential tokens.
- Never render raw AI output using `dangerouslySetInnerHTML` (prevents Stored/Reflected XSS).
- Never disable CORS or security headers for development convenience.

---

## 2. API Key Isolation Pattern

```typescript
// GOOD: Client invokes backend proxy; backend signs external API requests
export async function queryAI(prompt: string) {
  const response = await fetch('/api/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
}

// STRICTLY FORBIDDEN: Direct third-party AI keys in frontend bundle
// const GEMINI_KEY = "AIzaSy..."
```

---

## 3. Surabaya Bounding Box Guardrail

```python
SURABAYA_BBOX = {
    "min_lon": 112.55,
    "max_lon": 112.85,
    "min_lat": -7.38,
    "max_lat": -7.18
}

def validate_coordinates(lon: float, lat: float) -> bool:
    return (SURABAYA_BBOX["min_lon"] <= lon <= SURABAYA_BBOX["max_lon"] and
            SURABAYA_BBOX["min_lat"] <= lat <= SURABAYA_BBOX["max_lat"])
```

---

## 4. Competition Rubric Compliance (Coaching 1, 2, 3)

### Coaching 1: 8-Module PRD Structure
- [ ] Module 1: Problem Statement & Value Proposition
- [ ] Module 2: 3 User Personas (Transport Agency, Site Investor, Local MSME)
- [ ] Module 3: Field Survey Strategy (360 points across 5 SRRL commuter nodes)
- [ ] Module 4: Spatial Analytics Pipeline (H3 res 8/9, AHP TOD $CR \le 0.10$, SDM regression)
- [ ] Module 5: Scope Boundaries (Strictly prevent scope creep)
- [ ] Module 6: System Architecture (Next.js 16, FastAPI, PostGIS, MapLibre, Gemini)
- [ ] Module 7: Timeline & Risk Mitigation Matrix
- [ ] Module 8: Acceptance Criteria & Automated QA

### Coaching 2: AI Engineering Standards
- [ ] Dual-output response format (`data.action` + `data.text_response`).
- [ ] Deterministic parameter generator (AI requests server-side spatial functions rather than hallucinating geometries).
- [ ] Minimum 7 curated quick prompt chips on UI.

### Coaching 3: Value Proposition & Jury Evaluation
- [ ] Outcome Over Tool: Accelerates transit-oriented site analysis from 3 weeks to under 30 minutes.
- [ ] Anti-Bloat: Eliminate speculative gimmick features (no AR, no real-time train tracking); focus on the **Core TOD Decision Engine**.

---

## 5. Automated Secret & Security Verification
Run the internal security scanner before any production release or git push:
```bash
python scripts/scan_secrets.py
```
