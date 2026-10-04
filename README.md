# BioVerse

An interactive, full-stack human anatomy learning app. Explore organs in a visual viewer, take quizzes, review flashcards, study common diseases, ask an AI tutor, and run small physiology lab simulations.

Built as a student project with the MERN stack (MongoDB, Express, React, Node.js) and Docker.

## Features

- **Organ viewer**: 6 organ systems (brain, heart, lungs, digestive system, kidney, skeletal system) with pan, zoom, tilt and part-by-part detail. Rendered as 2.5D vector graphics, not a true 3D model.
- **Quizzes**: organ-specific questions with scoring, explanations and achievement badges.
- **Disease explorer**: 8 conditions (Alzheimer's, Parkinson's, myocardial infarction, asthma, diabetes, kidney stones, cirrhosis, osteoporosis) with symptoms, causes and treatments.
- **Flashcards**: flip cards grouped by organ.
- **AI tutor**: chat and explanations at school, college or medical level. Uses the Anthropic Claude API when `CLAUDE_API_KEY` is set; otherwise it falls back to built-in offline answers, so the app works without a key.
- **Virtual labs**: three simulators - osmosis and red blood cells, cardiac cycle and cardiac output, enzyme kinetics (temperature and pH).
- **Progress tracking**: daily streaks, mastery per organ, achievement badges, and a learning roadmap.
- **Accounts**: register and log in with JWT auth, bcrypt-hashed passwords, rate-limited auth routes.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Lucide icons |
| Backend | Node.js, Express, Helmet, Morgan, express-rate-limit |
| Database | MongoDB 7 with Mongoose |
| Auth | JWT, bcryptjs |
| AI | Anthropic Claude SDK, with an offline fallback |
| Infra | Docker, docker-compose |

## Getting started

### With Docker (recommended)

```bash
git clone https://github.com/nishan9-99/bioverse.git
cd bioverse
cp .env.example .env      # then edit .env and set real values
docker-compose up --build
```

The database is seeded automatically on first run.

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |
| Mongo Express | http://localhost:8081 (login from your `.env`) |

MongoDB and Mongo Express are bound to `127.0.0.1` only.

### Without Docker

You need Node.js 18+ and a running MongoDB.

```bash
# backend
cd backend
npm install
# create backend/.env with MONGO_URI and JWT_SECRET (see below)
npm run seed
npm run dev        # http://localhost:5000

# frontend (new terminal)
cd frontend
npm install
npm run dev        # http://localhost:3000
```

The frontend reads the API address from `VITE_API_URL` (for example `http://localhost:5000/api`).

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | yes | Secret for signing tokens. Generate with `openssl rand -hex 32`. The server will not start without it. |
| `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` | yes (Docker) | MongoDB root credentials used by docker-compose. |
| `MONGO_EXPRESS_USER` / `MONGO_EXPRESS_PASSWORD` | yes (Docker) | Login for the Mongo Express admin UI. |
| `MONGO_URI` | yes (no Docker) | MongoDB connection string. docker-compose builds it for you. |
| `CLAUDE_API_KEY` | no | Enables live Claude responses in the AI tutor. |
| `JWT_EXPIRE` | no | Token lifetime, default `7d`. |
| `FRONTEND_URL` | no | Allowed CORS origin, default `http://localhost:3000`. |
| `PORT`, `NODE_ENV` | no | Backend port (5000) and mode. |

## Password reset

There is no email service in this project. `POST /api/auth/forgot-password` creates a short-lived (10 minute), single-use reset token, stores only its hash, and does not return it in the response. In development the token is printed to the backend console; the reset page then takes that token plus the new password. To use this in production you would add email delivery.

## Project structure

```
bioverse/
├── backend/
│   ├── config/        database connection
│   ├── controllers/   route handlers (auth, organs, quiz, AI, ...)
│   ├── middleware/    JWT auth, error handling, rate limiting
│   ├── models/        Mongoose schemas
│   ├── routes/        Express routers
│   ├── services/      AI service (Claude + offline fallback)
│   ├── data/          static data
│   ├── seed.js        seeds organs and diseases
│   └── server.js
├── frontend/
│   └── src/           pages (Viewer, Quiz, Diseases, Flashcards, AiTutor, VirtualLab, ...) and components
├── nginx/             sample nginx config
├── docker-compose.yml
└── .env.example
```

## Notes

- Educational use only. This is not medical advice.
- Dev-oriented Docker setup (hot reload, bind mounts). Harden it before any real deployment.
