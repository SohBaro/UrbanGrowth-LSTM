# UrbanGrowth-LSTM (Frontend Dashboard) 🖥️

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-Fast-yellow)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

This directory contains the user interface for the **UrbanGrowth-LSTM** project. It is a modern, responsive web application built to visualize satellite road segmentation results in real-time.

**🔗 Live Preview:** [Coming Soon on Vercel](#) *(Link will be updated after deployment)*

## ⚡ Features

* **Interactive Dashboard:** Drag-and-drop file upload interface.
* **Real-time Visualization:** Side-by-side comparison of original satellite imagery and AI-generated road masks.
* **Modern UI:** Built with **Shadcn UI** and **Tailwind CSS** for a clean, scientific aesthetic.
* **Metrics Display:** Visualizes road pixel coverage and density stats.
* **Export Tools:** One-click download for segmentation masks and overlays.

## 🛠️ Tech Stack

* **Framework:** React 18 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Components:** Shadcn UI + Lucide React Icons
* **State Management:** React Hooks (`useState`, `useEffect`)

## 🚀 Local Development

To run this frontend locally, ensure you have **Node.js** installed.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

## 🔌 Backend Connection

**Note:** This frontend is designed to consume the **UrbanGrowth-LSTM Python Backend**.

For the image processing to work:
1.  The backend must be running locally on `http://127.0.0.1:8000`.
2.  The API endpoint used is `POST /predict`.

If the backend is offline, the UI will load, but file uploads will return a connection error.

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components (Hero, ResultsGrid, etc.)
├── pages/           # Main page views (Index.tsx)
├── hooks/           # Custom React hooks (use-toast)
└── main.tsx         # Entry point
