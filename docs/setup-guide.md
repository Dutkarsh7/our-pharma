# Our Pharma Setup Guide

## 1. Purpose
This document provides the standard local setup process for the Our Pharma project, including environment configuration, development startup, and basic troubleshooting.

## 2. Prerequisites

| Dependency | Recommended Version | Notes |
|---|---|---|
| Node.js | 18.x or later | Required for Vite and modern package tooling |
| npm | 9.x or later | Bundled with Node.js |
| Git | Latest stable | For source control and collaboration |
| Gemini API Access | Active | Needed for OCR and AI features |
| Supabase Project | Configured | Required for auth and backend features |

## 3. Clone and Install

```bash
git clone <repository-url>
cd tool
npm install
```

## 4. Environment Variables
Create a `.env.local` file in the project root and configure the keys below.

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:
- `VITE_` prefixed keys are exposed to the frontend by Vite.
- For Vercel deployments, also set `GEMINI_API_KEY` as a server-side environment variable so the OCR proxy route can use it safely.
- Keep `.env.local` out of version control.

## 5. Start Development Server

```bash
npm run dev
```

By default, Vite serves the app on `http://localhost:5173`.

## 6. Build for Production

```bash
npm run build
npm run preview
```

## 7. Feature Smoke Test Checklist
After startup, validate core flows:

1. Application shell loads without console errors.
2. Authentication UI renders and sign-in/sign-up actions are available.
3. Medicine scanner accepts an image and reaches Gemini extraction.
4. Results render with medicine alternatives and savings values.
5. Cart and checkout pages open with expected pricing data.

## 8. Common Troubleshooting

### 8.1 Missing Gemini Key
Symptoms:
- Scanner fails during analysis.

Resolution:
- Verify `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY` exists in `.env.local`.
- Restart the development server after editing environment variables.

### 8.2 Supabase Auth Errors
Symptoms:
- Login/signup fails or session is not established.

Resolution:
- Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.
- Verify Supabase auth providers and redirect URLs are correctly configured.

### 8.3 OCR Accuracy Issues
Symptoms:
- Incomplete extraction or no medicine match.

Resolution:
- Upload clear, well-lit images with readable text.
- Avoid highly tilted, blurry, or low-resolution prescriptions.

## 9. Team Workflow Notes
- Use feature branches for changes.
- Keep commits scoped and descriptive.
- Run local smoke checks before opening pull requests.
- Update docs when changing setup, environment keys, or architecture.
