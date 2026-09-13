# TransitERA Agent Instructions & Repository Rules

## 1. Iconography & UI Component Standards (Anti-Emoji Rule)
- **STRICT PROHIBITION**: Do NOT use raw Unicode emojis (e.g., 🚏, 🌊, 🚄, ✨, 👁️, 📈, 🚀, 💡, 🏷️) in user interfaces, button labels, dashboard cards, status badges, map popups, or dialog modals.
- **Visual Inconsistency**: Emojis render differently across operating systems (Windows, macOS, iOS, Android, Linux), breaking alignment and giving an unprofessional / prototype look.
- **Mandatory Alternatives**:
  - **Lucide Icons (`lucide-react`)**: Default standard for all interface icons (e.g., `<Bus className="w-4 h-4" />`, `<CloudRain className="w-4 h-4" />`, `<TrainFront className="w-4 h-4" />`, `<Sparkles className="w-4 h-4" />`, `<Eye className="w-4 h-4" />`, `<MapPin className="w-4 h-4" />`).
  - **shadcn/ui & Radix UI Primitives**: Use accessible components (`<Badge>`, `<Tooltip>`, `<Dialog>`, `<DropdownMenu>`, `<Popover>`, `<Tabs>`).
  - **Mantine UI**: Use for advanced data tables, segmented controls, or rich notification toasts.
  - **Custom SVG**: Use for bespoke cartographic map markers and vector brand assets.

## 2. Tech Stack & Engineering Standards
- **Frontend**: Next.js (App Router), React 19, MapLibre GL JS, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, PostGIS (PostgreSQL 16), Uber H3 (resolutions 8 & 9), Scikit-learn (PCA + Random Forest), Spatial Durbin Model (SDM).
- **Spatial AI**: Google Gemini API via FastAPI Proxy with dynamic model selection (`gemini-1.5-flash` / `gemini-2.0-flash`).
- **Quality Gates**: All code changes must pass Pytest (backend), Vitest (frontend), and `npm run build` with 0 type errors.

## 3. Branching & Deployment Strategy
- **`main` Branch**: Working dev branch containing complete research context (`context/`, meeting notes, PRDs, training scripts).
- **`deploy` Branch**: Production-only release branch containing only essential web application files (`webdev/frontend`, `webdev/backend`, `docker-compose.yml`, `docs/DEPLOYMENT_GUIDE.md`). Synchronized via `python scripts/sync_deploy_branch.py`.
