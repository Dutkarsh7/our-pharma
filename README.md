<div align="center">

<img width="1200" height="475" alt="Our Pharma Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<h1>💊 Our Pharma</h1>

<p><em>An AI-powered pharmacy platform for smarter, affordable healthcare</em></p>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://our-pharma.vercel.app/)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-our--pharma.vercel.app-blue?style=for-the-badge)](https://our-pharma.vercel.app/)

</div>

---

## 📖 About the Project

**Our Pharma** is a full-stack, AI-powered pharmacy platform designed to make healthcare more accessible and affordable. Built as a pre-final year college project, it leverages **Google Gemini AI** to analyse prescriptions, suggest cost-effective generic alternatives, and connect patients with doctors — all from one seamless interface.

> 🎓 *Pre-final year project — built with passion and a lot of caffeine.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Medicine Scanning** | Scan or upload a prescription image; Gemini AI extracts medicine names, strengths, and dosage automatically |
| 💰 **Price Lookup & Savings** | Compare branded vs. generic prices across 500+ medicines and see how much you save |
| 🩺 **Doctor Consultations** | Book telemedicine consultations with verified doctors directly in the app |
| 📋 **Prescription Management** | Manage and store your prescriptions securely in the cloud via Supabase |
| 🤖 **AI Chatbot** | 24/7 AI-powered support chatbot for medicine queries and guidance |
| 🛒 **Medicine E-commerce** | Add medicines to cart and proceed to checkout with 2-hour delivery promise |
| 🌐 **Multi-language Support** | Available in English, Hindi, Bengali, Marathi, Telugu, and Tamil |
| 🌙 **Dark / Light Mode** | Full theme toggle for comfortable reading in any environment |
| 🔐 **Authentication** | Secure user sign-up and login powered by Supabase Auth |
| 🛠️ **Admin Dashboard** | Manage orders, users, and medicines from a dedicated admin panel |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend Framework** | ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript_5.8-3178C6?logo=typescript&logoColor=white) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white) |
| **Backend / Database** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) |
| **AI / ML** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?logo=google&logoColor=white) |
| **Animations** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer&logoColor=white) |
| **Icons** | ![Lucide](https://img.shields.io/badge/Lucide_React-F56040?logo=lucide&logoColor=white) |
| **Charts** | ![Recharts](https://img.shields.io/badge/Recharts-8884d8) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) |

</div>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [Supabase](https://supabase.com/) project (for auth and database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Dutkarsh7/our-pharma.git
   cd our-pharma
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root and add the following keys:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > ⚠️ Never commit your `.env.local` file to version control.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser to see the app.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

---

## 📸 Screenshots

> *Replace these placeholders with actual screenshots from the running application.*

| Home / Landing | Medicine Scanner |
|:---:|:---:|
| ![Home Screen](screenshots/home.png) | ![Medicine Scanner](screenshots/scanner.png) |

| Medicine Search | Doctor Consultation |
|:---:|:---:|
| ![Medicine Search](screenshots/search.png) | ![Doctor Consultation](screenshots/consultation.png) |

| Prescription Analysis | Admin Dashboard |
|:---:|:---:|
| ![Prescription Analysis](screenshots/analysis.png) | ![Admin Dashboard](screenshots/admin.png) |

---

## 🌐 Live Demo

Try the live application here: **[https://our-pharma.vercel.app/](https://our-pharma.vercel.app/)**

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a new branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'Add some feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open a Pull Request** and describe what you've changed

Please make sure your code follows the existing TypeScript and React conventions used in the project.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Utkarsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🎓 College Project Disclaimer

> **This project was developed as a pre-final year academic project.**
>
> It is intended purely for **educational and demonstration purposes**. Our Pharma does **not** provide real medical advice, dispense actual medicines, or facilitate real monetary transactions. Always consult a qualified healthcare professional before making any medical decisions.
>
> The medicine data, prices, and doctor profiles used in this application are for demonstration only and may not reflect real-world accuracy.

---

<div align="center">

Made with ❤️ by **Utkarsh** &nbsp;|&nbsp; Pre-Final Year Project &nbsp;|&nbsp; 2025

⭐ If you found this project helpful, please consider giving it a star!

</div>
