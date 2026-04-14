<div align="center">
  <h1>📚 Smart Study Planner</h1>
  <p><b>An AI-Powered Academic Management Platform (MERN Stack)</b></p>
</div>

<br />

The **Smart Study Planner** is a comprehensive, aesthetic, whiteboard/sketch-styled web application built to help students manage academic syllabi, strictly track studying progress, and autonomously generate AI study schedules designed to crush exams. 

---

## 🌟 Key Features

* **AI Study Plan Generator:** Automatically splits your massive syllabus into manageable day-to-day study plans, intelligently weighing the difficulty of topics against your available hours.
* **Last-Night Mode (Emergency Prep):** Input your remaining hours before an exam to get a brutally optimized micro-plan ranked entirely by PYQ frequency and topic importance scorings.
* **Gamification & Achievements:** Climb the class leaderboard, earn experience points (XP) for tracking completed topics, unlock specific milestone badges, and build daily study streaks!
* **Pomodoro Overlay:** Complete built-in 25/5 Pomodoro timers tied into your study planner widget. Darkens backgrounds to lock your focus down.
* **Full Syllabus Tree Management:** Teachers can upload material, specify topic difficulties, and release subject codes for students to join in real time.
* **Hand-Drawn Doodle UI:** Fully customized organic glass/sketch architecture creating a soothing, notebook-mimicking user experience.

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite), React Router, Tailwind CSS (doodle aesthetic UI overrides), Zustand (State)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (via Mongoose ORM)
* **AI Integration:** Google Gemini SDK API (Configurable to local Ollama via roadmap)

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the Smart Study Planner up and running locally.

### 1. Prerequisites
Ensure you have the following installed to run this project:
* [Node.js](https://nodejs.org/en/) (v16.14 or higher)
* [Git](https://git-scm.com/)
* A free [MongoDB Atlas Database](https://mongodb.com/) (or local MongoDB connection).

### 2. Clone the Repository
Open your terminal and clone this repository down to your local machine:
```bash
git clone https://github.com/Mr-Talha-Mulani/Study_Planner.git
cd Study_Planner
```

### 3. Setup the Backend & Frontend Dependencies
You will need two dedicated terminal windows running to handle installing dependencies correctly.

**Terminal 1 (Backend Server):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm install
```

### 4. Configure Environment Variables
Navigate into the `/server` folder and create a `.env` file (`server/.env`). You must declare your secret keys here:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
JWT_SECRET=your_super_secret_jwt_string_here
GEMINI_API_KEY=your_google_gemini_api_key
```

### 5. Start the Application
Now, spin up both the client and the server. The frontend proxies internal `/api` traffic directly to the backend.

**Terminal 1 (Running the Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Running the Frontend):**
```bash
cd client
npm run dev
```

Open your browser and navigate to the local host address provided by Vite (usually `http://localhost:5173`).

### 6. (Optional) Run the Seed Script
If you want to instantly fill your database with demo teachers, subjects, syllabus trees, and students without having to manually register them all, simply run:
```bash
cd server
node seed.js
```

---

## 🎨 Default Test Accounts
If the database was properly seeded above, you can log in immediately using the following credentials:
* **Teacher Login:** `meera@college.in` / `demo1234`
* **Student Login (Topper):** `aarav@edu.in` / `demo1234`
* **Student Login (Average):** `neha@edu.in` / `demo1234`

Enjoy studying! 🚀
