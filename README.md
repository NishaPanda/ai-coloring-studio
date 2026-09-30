# 🎨 AI Coloring Studio

A web application where users can browse and digitally color coloring pages, with AI-powered color palette suggestions.

Built as a learning project to practice full-stack development and GitHub Actions CI/CD.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| HTTP Client | Axios |

---

## Project Structure

```
ai-coloring-studio/
├── client/     # React + Vite frontend
├── server/     # Node.js + Express backend
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account and cluster
- A Google Gemini API key (for AI suggestions, added later)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-coloring-studio
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Set up the frontend
```bash
cd client
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 4. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/test

---

## Features (Planned)

- [ ] User registration and login
- [ ] Browse coloring pages by category and difficulty
- [ ] Interactive coloring canvas (color picker, fill, eraser, undo/redo)
- [ ] Save and view your colored artwork
- [ ] AI color palette suggestions

---

## License

MIT
