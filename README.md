# 📡 SubRadar — Smart Subscription & Recurring Expense Tracker

SubRadar is a full-stack, dark-mode-first mobile subscription and recurring expense tracking application built with **React Native (Expo)** and **Node.js (Express + TypeScript + Prisma)**.

Inspired by modern fintech UIs on Dribbble, SubRadar replaces boring spreadsheets with playful pastel card stacks, real-time monthly budget analytics, and proactive payment radars.

---

## 🚀 Tech Stack

### Mobile Client
- **Framework:** React Native (Expo SDK 58, Expo Router)
- **Language:** TypeScript (Strict Mode)
- **State & Server Cache:** Zustand, TanStack Query (React Query)
- **Security:** Expo SecureStore (Encrypted JWT token storage)
- **Icons & UI:** Lucide React Native, Custom SVG Notched Cards, React Native Safe Area Context

### Backend & Database
- **Runtime & Framework:** Node.js, Express.js
- **Language:** TypeScript
- **ORM & Database:** Prisma ORM, Serverless PostgreSQL (Neon)
- **Auth & Security:** JWT (JSON Web Tokens), bcryptjs password hashing (12 rounds)
- **Validation:** Zod schema validation middleware
- **Architecture:** Layered Clean Architecture (Routes → Controllers → Services → Prisma Models)

---

## ✨ Key Features
- **Curated 20+ Presets:** Instant 1-tap onboarding for popular platforms (Spotify, Netflix, ChatGPT Plus, Apple TV, etc.) with pre-filled prices and official brand colors.
- **Dynamic Stacked Cards:** Custom SVG-rendered continuous card stack on Dashboard displaying active subscriptions.
- **Payment Radar:** Horizontal carousel highlighting upcoming renewals due within 7 to 30 days.
- **Monthly Analytics & Projection:** Automatic normalization of weekly, monthly, and yearly subscriptions into a unified monthly expenditure figure.
- **Native Date Controls:** Quick-select chips ("Next Month Same Day", "In 15 Days") with automatic month-end day clamping.
- **Optimistic UI:** Instant deletions and synchronized state across Dashboard, Radar, and Lists.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Expo Go on iOS / Android

### Backend Setup
\`\`\`bash
cd backend
npm install
npx prisma migrate dev
npm run dev
\`\`\`

### Mobile Setup
\`\`\`bash
cd mobile
npm install
npx expo start -c
\`\`\`