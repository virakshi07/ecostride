# 🌿 EcoStride

**AI-powered carbon footprint tracking, coaching, and gamification — the fitness tracker for your environmental impact.**

[![Live Demo](https://img.shields.io/badge/demo-live-2C5F2D)](https://YOUR-VERCEL-URL.vercel.app)
[![PromptWars Solution Challenge](https://img.shields.io/badge/PromptWars-Solution%20Challenge-8A2BE2)](#)

> Most people want to fight climate change but have no idea how their daily choices add up. EcoStride fixes that — continuous tracking, AI coaching, and social accountability, all in one habit-forming app.

🔗 **Live demo:** [[your-vercel-url.vercel.app](https://YOUR-VERCEL-URL.vercel.app)](https://carbon-footprint-frrwz9yi5-virakshi07s-projects.vercel.app/)
📦 **Repo:** you're already here

---

## 🌍 About

EcoStride was developed as a solution for the **PromptWars Solution Challenge – Carbon Footprint Awareness Platform**.

The platform empowers individuals to understand, monitor, and reduce their carbon footprint through AI-powered insights, personalized sustainability coaching, gamification, and community-driven accountability. By transforming complex environmental data into simple daily actions, EcoStride helps users build sustainable habits that create measurable impact.

---

## 📸 Preview

![EcoStride Dashboard](./screenshots/dashboard.png)

---

## ✨ Features

* **Carbon Footprint Calculator** — real-time emissions across transport, energy, food, shopping, and waste
* **Sustainability Score** — a single 0–100 score that summarizes trend and effort, like a credit score for your footprint
* **AI Carbon Coach** — conversational, natural-language explanations of *why* your footprint changed
* **Activity Tracking** — log trips, meals, purchases, and bills in seconds
* **Gamification** — streaks, badges, leaderboards, and redeemable eco-coins
* **Community** — city leaderboards, friend circles, and group challenges
* **Carbon Offsets** — a marketplace for offsetting residual emissions through verified projects

---

## 🧠 What Makes It Different

EcoStride isn't a one-time calculator — it's a continuous AI-driven sustainability ecosystem.

### 1. AI Carbon Coach

Provides personalized explanations, recommendations, and sustainability guidance based on user behavior.

### 2. Predictive Carbon Forecasting

Forecasts future emissions and warns users before they exceed monthly carbon goals.

### 3. Receipt & Meal Scanning

Uses computer vision to automatically classify groceries, meals, and purchases from uploaded photos.

### 4. Smart Nudge Engine

Learns which sustainability interventions work best for each user and adapts recommendations accordingly.

### 5. Peer Benchmarking

Compares users against similar lifestyle groups, making progress more realistic and motivating.

### 6. Sustainability Score

A dynamic environmental score that reflects footprint trends, consistency, and positive actions.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS v4
* Recharts
* Lucide React

### Backend

* FastAPI
* Python
* SQLAlchemy ORM
* Pydantic
* SQLite (PostgreSQL-ready)

### AI & Analytics

* Gemini API / LLM Integration
* Carbon Emission Prediction Engine
* Computer Vision for Receipt Scanning
* Personalized Recommendation System

### Data Sources

* IPCC Emission Factors
* EPA Emission Datasets
* DEFRA Carbon Conversion Factors

---

## 🚀 Getting Started

### Frontend

```bash
npm install
npm run dev
```

Application runs at:

```text
http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

API available at:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

## 📁 Project Structure

```text
├── src/
│   ├── pages/
│   │   ├── Dashboard
│   │   ├── LogActivity
│   │   ├── Insights
│   │   ├── Community
│   │   └── ProfileRewards
│   │
│   ├── components/
│   │   ├── Gauge
│   │   ├── Toast
│   │   └── AnimatedCount
│   │
│   └── api.ts
│
├── backend/
│   ├── models.py
│   ├── crud.py
│   ├── main.py
│   └── seed.py
│
└── EcoStride_Carbon_Footprint_Platform.md
```

---

## 🏗️ System Architecture

### User Layer

* Web Application
* Mobile Responsive Interface

### Application Layer

* Activity Tracking Module
* Carbon Calculation Engine
* Sustainability Score Engine
* Community & Gamification Module
* AI Carbon Coach

### Data Layer

* User Profiles
* Activities
* Emission Factors
* Challenges
* Rewards
* Community Rankings

### AI Layer

* Recommendation Engine
* Forecasting Engine
* Computer Vision Scanner
* Behavioral Analysis System

---

## 🎯 Sustainability Impact

EcoStride aims to:

* Increase carbon awareness through continuous tracking
* Encourage sustainable lifestyle choices through gamification
* Reduce individual emissions through personalized interventions
* Build communities around climate-positive actions
* Create measurable environmental impact at scale

---

## 🏆 Why EcoStride Stands Out

Unlike traditional carbon footprint calculators that provide a one-time estimate, EcoStride acts as a daily sustainability companion.

It combines:

* Real-time tracking
* AI-powered coaching
* Behavioral science
* Gamification
* Community engagement
* Predictive analytics

to create long-term environmental habit change.

---

## 🤖 Built With AI

This project was developed for the **PromptWars Solution Challenge** using AI-assisted development from concept to implementation.

* **Claude AI** — Product architecture, carbon calculation methodologies, database design, and sustainability workflows.
* **Google Antigravity** — Application generation, implementation, testing, and rapid prototyping.
* **Generative AI Models** — Personalized coaching, recommendation generation, and user insights.

---

## 📄 License

Built as a submission for the PromptWars Solution Challenge.

---

### 🌍 EcoStride

**Turning carbon awareness into daily, rewarding action.**
ily, rewarding action.* 🌍
