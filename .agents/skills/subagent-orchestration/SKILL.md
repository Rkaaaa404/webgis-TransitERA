---
name: subagent-orchestration
description: >-
  Guide for orchestrating TransitERA custom subagents. Defines when and how to
  delegate tasks to the 6 specialized subagents (Frontend Engineer, Backend
  Spatial Engineer, Spatial AI Architect, DevOps Deployer, QA & Security Auditor,
  Research Analyst). Use when the user requests multi-file changes, parallel
  workstreams, or complex tasks spanning frontend + backend + deployment.
---

# Subagent Orchestration Guide (TransitERA)

## 1. Available Subagent Roster

| Subagent | Role | Model | Write Access | Best For |
| :--- | :--- | :---: | :---: | :--- |
| `frontend-engineer` | UI/UX & Map Layers | flash | Yes | React components, MapLibre layers, Tailwind styling, Recharts charts |
| `backend-spatial-engineer` | Spatial Engine & API | pro | Yes | FastAPI endpoints, PostGIS queries, H3 indexing, ML models, AHP scoring |
| `spatial-ai-architect` | Gemini AI Assistant | pro | Yes | Function Calling schemas, AI proxy, prompt engineering, dual-output responses |
| `devops-deployer` | Cloud Deployment | flash | Yes | Vercel config, Docker, Supabase setup, branch sync, env vars |
| `qa-security-auditor` | Testing & Security | pro | Yes | Pytest, Vitest, OWASP audit, code review, competition rubric compliance |
| `research-analyst` | Codebase Research | flash | No | Read PRDs, analyze data files, web search for TOD references, summarize context |

---

## 2. Delegation Decision Matrix

### Use a SINGLE subagent when:
- Task is scoped to one domain (e.g., "add a new API endpoint" → `backend-spatial-engineer`)
- Task is a focused investigation (e.g., "what does the PRD say about Modul 7?" → `research-analyst`)

### Use PARALLEL subagents when:
- Task spans frontend + backend (e.g., "add isochrone layer with new API endpoint")
  → Launch `frontend-engineer` + `backend-spatial-engineer` simultaneously
- Task needs implementation + verification (e.g., "fix the CORS bug and verify it works")
  → Launch `backend-spatial-engineer` + `qa-security-auditor` simultaneously
- Pre-deployment checklist
  → Launch `qa-security-auditor` + `devops-deployer` + `research-analyst` simultaneously

### Use SEQUENTIAL subagents when:
- Backend API must exist before frontend can consume it
  → First: `backend-spatial-engineer`, then: `frontend-engineer`
- Research must inform implementation
  → First: `research-analyst`, then: relevant engineer subagent

---

## 3. Common Orchestration Patterns

### Pattern A: Full-Stack Feature
```
1. research-analyst     → Understand requirements from PRD
2. backend-spatial-engineer → Build API endpoint + tests
3. frontend-engineer    → Build UI component consuming the API
4. qa-security-auditor  → Run full test suite + security scan
```

### Pattern B: Competition Demo Prep
```
Parallel:
  - devops-deployer     → Deploy latest to Vercel + HF Spaces
  - qa-security-auditor → Run all quality gates
  - research-analyst    → Verify rubric compliance
```

### Pattern C: AI Feature Development
```
1. spatial-ai-architect → Design Function Calling schema + backend handler
2. frontend-engineer    → Build chat UI + map action renderer
3. qa-security-auditor  → Validate AI responses + security
```

---

## 4. Rules for Subagent Coordination
1. Always provide subagents with specific file paths, not vague instructions.
2. When two subagents edit the same file, run them SEQUENTIALLY to avoid conflicts.
3. After subagents complete, the main agent should run quality gates:
   - `cd webdev/backend && pytest`
   - `cd webdev/frontend && npm test && npm run build`
4. Prefer `flash` model for simple tasks (styling, config, research) and `pro` for complex reasoning (spatial algorithms, AI integration, security audit).
