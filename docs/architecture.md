# Our Pharma Architecture

## 1. System Overview
Our Pharma is an AI-powered pharmacy platform built as a full-stack web application. The platform enables users to scan prescriptions, identify medicines, compare branded and generic pricing, and proceed through a medicine order flow.

The current application is implemented with a React + Vite frontend and service integrations for Gemini AI and Supabase.

## 2. Goals
- Provide quick prescription intelligence with an accessible UI.
- Improve medicine affordability by surfacing generic alternatives.
- Offer a connected care journey through consultation and checkout.
- Maintain a modular codebase suitable for academic and production-style evaluation.

## 3. High-Level Architecture

| Layer | Responsibility | Key Files |
|---|---|---|
| Presentation | UI rendering, responsive layouts, animations | App.tsx, components/* |
| Domain Logic | Matching, scanner workflow, pricing summary | components/MedicineScanner.tsx, src/data/* |
| AI Integration | OCR and prescription analysis | services/geminiService.ts |
| Backend Integration | Authentication and persistence | src/lib/supabase.ts, components/Auth.tsx |
| Data | Local medicine catalogs and CSV assets | medicines.csv, medicine_prices.csv, src/data/medicines.ts |

## 4. Frontend Structure

### 4.1 Application Shell
- `App.tsx` manages application state, view switching, language preferences, and theme.
- `Header.tsx` and related shared components handle navigation and top-level actions.

### 4.2 Feature Components
- `components/MedicineScanner.tsx`: Prescription upload, Gemini extraction, and generic match rendering.
- `components/AnalysisResult.tsx`: Savings and categorized medicine recommendation display.
- `components/Checkout.tsx`: Cart summary and order flow.
- `components/DoctorConsult.tsx` and `components/ConsultationBooking.tsx`: Consultation workflows.
- `components/ChatBot.tsx`: Assistant-style medicine support interactions.

## 5. AI and Matching Flow

1. User uploads prescription image.
2. Image is converted to Base64 client-side.
3. Gemini API is called for extraction and structured medicine insights.
4. Extracted medicine text is matched against local medicine records.
5. UI displays alternatives, pricing deltas, and savings insights.

## 6. Data and Pricing Model
- Core medicine properties include brand name, generic equivalent, price fields, manufacturer, and usage metadata.
- Savings are computed using:

```text
savings = brand_price - generic_price
```

- Monthly and yearly savings values are derived from per-medicine totals in the analysis phase.

## 7. Security and Configuration Notes
- API keys are loaded via environment variables and must not be hardcoded.
- Supabase credentials are stored in runtime configuration and used by client services.
- The project should be deployed with environment-specific values for local, staging, and production.

## 8. Scalability Considerations
- Replace static medicine lists with parsed CSV or database-backed search.
- Add normalized medicine indexing for stronger fuzzy matching.
- Persist scanner history per user in Supabase for audit and analytics.
- Introduce API rate limiting and request retry strategies for third-party AI calls.

## 9. Non-Functional Requirements
- Responsive behavior across desktop and mobile devices.
- Graceful error states for OCR failures and network interruptions.
- Clear user feedback for loading, success, and fallback actions.

## 10. Future Enhancements
- Confidence scoring and manual medicine correction UI.
- User-specific savings dashboard with historical trends.
- Stronger consultation workflows integrated with pharmacy inventory checks.
- Server-side validation for critical medicine substitution recommendations.
