---
name: vercel-deployment
description: Deploy TransitERA Next.js 16 frontend to Vercel. Covers preview deployments, production releases, monorepo root settings (webdev/frontend), environment variables configuration, and deployment branch synchronization.
license: MIT
---

# Vercel Deployment for TransitERA

Specialized deployment guide for TransitERA Next.js 16 (App Router + Turbopack) on Vercel.

## 1. Project Root Directory Configuration
In Vercel Project Settings:
- **Root Directory**: `webdev/frontend`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (Turbopack)
- **Output Directory**: `.next`

## 2. Environment Variables Checklist
Ensure the following variables are configured in **Vercel Project Settings > Environment Variables**:
- `NEXT_PUBLIC_MAPID_API_KEY`: Kunci API GEO MAPID yang telah di-whitelist untuk domain Vercel tim Anda.
- `NEXT_PUBLIC_BACKEND_URL`: URL public backend FastAPI (contoh: `https://api.transitera.id/api` atau Railway/Render/Koyeb deployment).

> [!CAUTION]
> **Zero Leakage**: Never hardcode API keys or database passwords into `.env` files tracked by git. Always configure them in the Vercel Dashboard.

## 3. Branching & Deployment Strategy
Follow TransitERA repository rules:
1. **`main` Branch (Development & Research)**:
   - Contains all research data (`context/`), PRDs, notulensi, and `.agents/`.
   - Vercel Git integration creates **Preview Deployments** on every push/PR to `main` (or feature branches).

2. **`deploy` Branch (Clean Production Release)**:
   - Contains ONLY essential application code (`webdev/`, `docker-compose.yml`, `docs/DEPLOYMENT_GUIDE.md`).
   - Run the automated synchronizer:
     ```bash
     python scripts/sync_deploy_branch.py
     git push origin deploy
     ```
   - Vercel automatically deploys `deploy` as the **Production Release**.

## 4. Vercel CLI Workflows

```bash
# Check authentication status
vercel whoami

# Deploy preview directly from webdev/frontend
vercel deploy webdev/frontend -y --no-wait

# Inspect deployment build status
vercel inspect <deployment-url>

# Production deploy (only when explicitly requested)
vercel deploy webdev/frontend --prod -y --no-wait
```

## 5. Next.js 16 Vercel Performance Checklist
- Ensure `next.config.ts` has `output: 'standalone'` when deploying Docker, or default serverless for Vercel.
- Verify that dynamic MapLibre components use `next/dynamic` with `ssr: false` to avoid SSR hydration mismatches.
- Ensure all static routes are prerendered as static content during `npm run build`.
