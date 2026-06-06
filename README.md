# Kathmandu Smart Bus

A production‑ready MERN application for real‑time public transportation in the Kathmandu Valley.

## Features
- Live bus tracking with map visualisation
- One‑click passenger pickup requests
- Driver and admin dashboards
- JWT authentication & role‑based access
- Socket.IO real‑time communication
- Push notifications (FCM stub) and image uploads (Cloudinary stub)
- Internationalisation (English & Nepali)
- Dockerised deployment

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Redux Toolkit, Leaflet (or Google Maps), Socket.IO client
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO server, JWT, Firebase Admin (FCM), Cloudinary
- **DevOps**: Docker Compose, ESLint, Prettier, Jest, Cypress (optional)

## Getting Started
```bash
# Clone repo
git clone <repo-url>
cd kathmandu-smart-bus

# Install dependencies (root monorepo)
npm install

# Set up environment variables (copy .env.example)
cp .env.example .env

# Start development servers
npm run dev
```

For detailed deployment instructions see `DEPLOYMENT.md`.
