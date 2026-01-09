# 📊 AI Review Analytics Dashboard

![Python](https://img.shields.io/badge/python-3.9%2B-blue) ![React](https://img.shields.io/badge/react-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC)

A production-grade, single-page web application featuring two distinct dashboards: a public-facing **User Review Portal** and a secure **Admin Analytics Dashboard**. It leverages **Llama 3 (via Groq)** to provide instant intelligent feedback and actionable business insights.

---

## 🌐 Live Demo

| Component | URL |
|:---|:---|
| **User Dashboard** | [https://fynd-intern-assignment.vercel.app/](https://fynd-intern-assignment.vercel.app/) |
| **Admin Dashboard** | [https://fynd-intern-assignment.vercel.app/admin](https://fynd-intern-assignment.vercel.app/admin) |

> **Admin Credentials**: `admin` / `password123`

---

## 🌟 Comprehensive Feature List

### 🅰️ Part A: User Dashboard (Public)
*   **Intuitive Review Interface**: A clean, modern form for users to submit star ratings (1-5) and written feedback.
*   **Real-Time AI Response**: upon submission, the system uses server-side LLM calls to generate an immediate, personalized, and empathetic response to the user.
*   **Submission Animations**: Smooth entry and success state animations using Framer Motion.
*   **Validation**: Robust handling of empty inputs, long text, and API errors.

### 🅱️ Part B: Admin Dashboard (Internal)
#### 🔐 Authentication & Security
*   **Secure Login**: JWT-based authentication system.
*   **Protected Routes**: Admin pages are inaccessible without a valid session.
*   **Logout Functionality**: One-click secure session termination.

#### 📈 Advanced Analytics
*   **Live KPI Cards**: Real-time display of Total Reviews, Average Rating, and Net Sentiment Score.
*   **Rating Distribution Chart**: Bar chart visualization of star rating spread.
*   **Monthly Trend Graph**: Area chart showing review volume trends over the last 12 months.

#### 🧠 AI-Powered Insights
*   **Review Summarization**: Automatically generates concise 15-word summaries for every review.
*   **Sentiment Analysis**: Classifies reviews as Positive, Neutral, or Negative.
*   **Aspect Extraction**: Identifies key topics mentioned (e.g., "Food", "Service", "Ambience", "Price").
*   **Actionable Recommendations**: AI suggests a specific "Next Action" for admins based on the review content.
*   **Weekly AI Summary**: A special "Newsletter" card that compares this week's performance vs. last week, highlighting key trends and changes.

#### 🛠️ Management Tools
*   **Smart Filtering System**: Filter the review list by:
    *   Minimum Star Rating
    *   Keyword Search
    *   Specific Month
    *   Sentiment Category
    *   Specific Aspect (e.g., show all reviews about "Service")
*   **Admin Notes**: Admins can add private, internal notes to any review for team collaboration.
*   **PDF Report Generation**: One-click download of a comprehensive **Monthly Performance Report** (PDF) including aggregated stats and AI summaries.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|:---|:---|:---|
| **Frontend** | **React 18** + **Vite** | Fast, responsive UI components |
| **Styling** | **TailwindCSS** | Modern, utility-first styling |
| **State** | **TanStack Query** | Efficient server state management & caching |
| **Backend** | **Python FastAPI** | High-performance async API |
| **Database** | **SQLModel (SQLite)** | Relational data persistence |
| **AI / LLM** | **Groq API** | Llama-3-70b-versatile for ultra-fast inference |
| **Reporting** | **FPDF2** | Programmatic PDF generation |
| **Deployment** | **Vercel** / **Render** | Cloud hosting for Frontend and Backend |

---

## 🚀 Setup & Installation

### Prerequisites
*   Python 3.9+
*   Node.js 16+
*   [Groq API Key](https://groq.com/)

### 1️⃣ Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in `backend/`:
```env
GROQ_API_KEY=gsk_your_key_here
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
Run Server: `uvicorn main:app --reload` (Port 8000)

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Run App: `http://localhost:5173`

---

## 🔐 Admin Access Helpers

Use these credentials to access the Admin Dashboard:

| Role | Username | Password |
|:---|:---|:---|
| **Super Admin** | `admin` | `password123` |

*(Note: The admin user is automatically created on the first backend startup)*

---


