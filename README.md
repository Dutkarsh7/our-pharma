<div align="center">

![Our Pharma Banner Placeholder](./assets/banner-placeholder.png)

# Our Pharma

### AI-Powered Pharmacy Platform for Smart, Affordable Healthcare

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://our-pharma.vercel.app)

</div>

## About The Project
Our Pharma is a pre-final year college project focused on improving medicine accessibility through AI. The platform helps users scan prescriptions, compare branded medicines with affordable generic alternatives, consult doctors, and manage prescriptions in a modern full-stack web experience.

This project is built using TypeScript, React, and Vite for a fast frontend, Supabase for backend/auth services, and Google Gemini AI for OCR and prescription intelligence.

## Live Demo
Visit the live app: [our-pharma.vercel.app](https://our-pharma.vercel.app)

## Features
- 💊 AI-powered medicine scanning from prescription images
- 🧾 Prescription text extraction and management workflow
- 🩺 Doctor consultation booking flow
- 💰 Medicine price lookup for branded vs generic comparison
- 🛒 Pharmacy-style ordering and checkout experience
- 🔐 User authentication and data handling via Supabase
- 📱 Responsive UI for desktop and mobile use

## Tech Stack
| Layer | Technology | Purpose |
|---|---|---|
| 🎨 Frontend | React 19 + TypeScript + Vite | UI development and fast build tooling |
| 🎬 UI/Animation | Framer Motion + Lucide React | Smooth transitions and iconography |
| 📊 Visualization | Recharts | Savings and medicine data representation |
| 🗄️ Backend | Supabase | Authentication, database, and API services |
| 🤖 AI | Google Gemini API | OCR and medicine intelligence |
| 🚀 Deployment | Vercel | Production hosting and CI/CD |

## Prerequisites
Before running locally, ensure you have:

| Requirement | Recommended Version |
|---|---|
| Node.js | 18.x or above |
| npm | 9.x or above |
| Gemini API Key | Active key from Google AI Studio |

## Installation and Local Setup
1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

If you deploy on Vercel, add the same value as a server-side environment variable named `GEMINI_API_KEY` and redeploy.

4. Start the development server:

```bash
npm run dev
```

5. Open the local URL shown in terminal (usually `http://localhost:5173`).

## Screenshots
> Replace these placeholder images with actual project screenshots.

| Module | Preview |
|---|---|
| Home / Landing | ![Landing](./screenshots/landing.png) |
| Medicine Scanner | ![Scanner](./screenshots/medicine-scanner.png) |
| Doctor Consultation | ![Doctor Consultation](./screenshots/doctor-consult.png) |
| Prescription/Price Lookup | ![Price Lookup](./screenshots/price-lookup.png) |

## Project Structure (High-Level)
| Directory/File | Description |
|---|---|
| `components/` | Reusable UI modules such as scanner, auth, checkout, chatbot |
| `services/` | API/service integrations including Gemini logic |
| `src/lib/` | Supabase client and utility integrations |
| `src/data/` | Medicine and lookup datasets |
| `supabase/` | SQL scripts and schema-related files |

## Contributing
Contributions are welcome and appreciated.

1. Fork the repository.
2. Create a new branch for your feature.
3. Commit your changes with clear messages.
4. Push to your fork and open a pull request.

For major changes, open an issue first to discuss the proposed updates.

## License
This project is licensed under the MIT License.

---

## College Project Disclaimer
This software is developed as a pre-final year academic project. It is intended for educational and demonstration purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
