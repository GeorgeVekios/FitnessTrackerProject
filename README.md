# Fitness Tracker

A web-based fitness tracking application for logging workouts, tracking progress, and analyzing performance over time.

## Project Vision

A clean, intuitive fitness tracker that helps users:
- Log workouts quickly and efficiently
- Track progress over time with detailed history
- Visualize improvements through charts and analytics
- Access their data from any device

## Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **PostgreSQL** database
- **Express** or **Fastify** for REST API
- **Prisma** ORM for type-safe database access
- **Google OAuth 2.0** for authentication

### Frontend
- **React** with **TypeScript**
- **Next.js** (or Create React App)
- Responsive design for mobile/tablet/desktop

### Future
- **iOS app** (React Native or native Swift)

## Core Features

### MVP (Phase 1)
1. **User Authentication**
   - Google OAuth login
   - Multi-device sync

2. **Workout Logging**
   - Log exercises with sets, reps, and weight
   - Add notes to individual sets and workouts
   - Track workout duration

3. **Exercise Library**
   - Pre-populated exercise database
   - Search and filter exercises
   - Exercise instructions/form tips

4. **Workout Templates**
   - Save favorite workouts as templates
   - Quick-start workouts from templates
   - Edit and customize templates

5. **Progress Tracking**
   - Workout history view
   - Personal records (PRs) tracking
   - Volume and tonnage tracking

6. **Analytics & Charts**
   - Progress charts (strength over time)
   - Volume trends
   - Workout frequency

## Project Status

✅ **Initial Setup Complete** - Backend and frontend scaffolding complete
- Backend API with Express, TypeScript, and Prisma
- Frontend with React, TypeScript, and Vite
- Google OAuth authentication configured
- Database schema defined

## Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

**TL;DR:**
1. Set up PostgreSQL database
2. Configure environment variables (Google OAuth credentials)
3. Run migrations: `cd backend && npm run db:migrate`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`
6. Visit http://localhost:3000

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines and architecture decisions.

## License

_(To be determined)_
