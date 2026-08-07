# Movie Streaming Frontend (SyncStream)

![React](https://img.shields.io/badge/React-18.x-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg) ![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-teal.svg)

A modern, high-performance web client for real-time movie streaming, watch parties, synchronized video playback, and chat features.

## 🚀 Features

- **Synchronized Video Playback**: Real-time video player controls (play, pause, seek) synchronized via WebSockets.
- **Watch Parties & Rooms**: Create or join room sessions with friends.
- **Live Chat**: Concurrent room chat stream with participant lists.
- **Responsive UI/UX**: Dark mode styling built with React, Tailwind CSS, Lucide icons, and Framer Motion.
- **Media Uploads & Storage**: Support for cloud media and local video streaming sources.

## 🛠️ Project Structure

```text
frontend/
├── public/              # Static assets & public resources
├── src/                 # Application source code
│   ├── assets/          # Images, icons, and dynamic media assets
│   ├── components/      # UI components (Player, Chat, Navbar, Controls)
│   ├── context/         # React Context providers (Auth, Socket, Stream)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Application views/routes
│   ├── services/        # API and WebSocket client services
│   ├── types/           # TypeScript interfaces & types
│   ├── App.tsx          # Main application component
│   └── main.tsx         # App entry point
├── .gitignore           # Git ignore file
├── index.html           # HTML entry point
├── package.json         # Package dependencies & scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 💻 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Framer Motion
- **Icons**: Lucide React
- **Icons & Maps**: Leaflet Maps

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

## ⚙️ Environment Setup

Create a `.env` file in the root of the `frontend` directory:

```env
VITE_API_URL=http://localhost:8080
```

For production deployments (e.g. Vercel / Netlify):
```env
VITE_API_URL=https://your-backend-api.onrender.com
```

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## 🌐 Deployment

This frontend app can be easily deployed to **Vercel**, **Netlify**, or **Cloudflare Pages**:
1. Import repository: `https://github.com/harashwar006/movie_streaming_frontend.git`
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure `VITE_API_URL` in environment variables.

---
© 2026 SyncStream Movie Streaming App.
