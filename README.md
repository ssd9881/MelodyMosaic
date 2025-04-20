# 🎶 MelodyMosaic

MelodyMosaic is a TypeScript + React-powered web application that gives users personalized control over their Spotify playlists. From intelligent sync between playlists using custom filters to automatic mood-based playlist generation, MelodyMosaic takes music curation to the next level.

---

## 🚀 Features

- **Smart Playlist Sync:**
  - Sync songs from child playlists to a parent playlist using filters
  - Filters include: popularity, energy, valence, recently added, artist match, and tempo range

- **Dynamic Playlist Modification:**
  - Apply filters to modify your parent playlist in real-time
  - Changes are reflected immediately in your connected Spotify account

- **Filter UI:**
  - Easy-to-use form lets users select filters and sync with one click
  - Dynamic input fields based on selected filters

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript
- **Backend:** Flask (for persistence and smart sync)
- **Authentication:** Spotify OAuth 2.0
- **APIs:** Spotify Web API
- **Tools:** GitHub, Postman, VS Code, npm

---

## 🧠 Why TypeScript?

- Provides type safety for Spotify’s deeply nested API responses
- Enables scalable, maintainable code with cleaner refactoring
- Improves developer experience with better autocompletion and error prevention

---

## 🎥 Demo Highlights

- Smart Sync with Filters (user-defined rules)
- MoodFlow playlist creation based on recent listening behavior
- Spotify-inspired UI with a dark theme and neon green highlights

---

## 📦 Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/melodymosaic.git
cd melodymosaic
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_SPOTIFY_SCOPE=user-library-read playlist-read-private playlist-modify-private
```

4. Start the frontend:
```bash
npm run dev
```

> Optional: Set up Flask backend for sync endpoints if persistence is needed.

---

## 📂 Folder Structure
```
├── src/
│   ├── components/
│   ├── utils/
│   ├── Classes/
│   └── App.tsx
├── public/
├── .env
└── README.md
```

---

## 🤝 Contributors
- Sharvary
- Mrunmayi
- Mrudul
- Ashutosh
- Nishit
- Abhishek

---

---

## 🌟 Acknowledgements
- Spotify Web API
- TypeScript Team
- React Community


