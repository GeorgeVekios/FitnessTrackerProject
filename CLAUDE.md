# Claude Code Context

This file provides context for Claude Code when working on the Fitness Tracker project across different devices and sessions.

## Project Overview

A fitness tracking web application built with Node.js/TypeScript backend and React frontend. The app allows users to log workouts, track progress, and analyze their fitness journey over time.

## Architecture Decisions

### Technology Choices
- **Backend**: Node.js + TypeScript + PostgreSQL
  - Chose PostgreSQL for robust time-series data handling and complex queries
  - TypeScript for type safety across the stack
  - Consider Prisma ORM for database modeling

- **Frontend**: React + TypeScript
  - Web-first approach with potential React Native iOS app later
  - TypeScript for shared types between frontend/backend

- **Authentication**: Google OAuth 2.0
  - Simple for users, no password management
  - Enables multi-device sync via user accounts

### Data Model Considerations

Key entities to model:
- **Users** - authenticated via Google OAuth
- **Exercises** - library of exercises (searchable, categorized)
- **Workouts** - collection of exercises performed on a date
- **Sets** - individual sets within a workout (exercise, reps, weight, notes)
- **Templates** - saved workout routines for quick reuse
- **Personal Records** - track PRs per exercise

Time-series data is central - most queries will involve filtering by user and date ranges.

## Feature Scope

### In Scope (MVP)
✅ Workout logging (exercises, sets, reps, weight)
✅ Notes on sets and workouts
✅ Workout templates/routines
✅ Exercise library
✅ Workout history
✅ Progress charts and analytics
✅ Multi-device sync
✅ Google OAuth authentication

### Nice-to-Have (Post-MVP)
- Rest timer
- Plate calculator
- 1RM calculator
- Progressive overload suggestions
- Data export
- Social features
- Workout programs
- Nutrition tracking
- Wearable integration (HealthKit for iOS)

### Explicitly Out of Scope (For Now)
- Nutrition tracking
- Social/sharing features
- Third-party integrations
- Offline-first (may reconsider for mobile)

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components (React)
- Use async/await over promises
- Meaningful variable names over comments

### Database
- Use migrations for schema changes
- Index fields used in queries (user_id, workout_date, exercise_id)
- Consider JSONB for flexible workout metadata

### API Design
- RESTful endpoints
- Consistent error responses
- Validate input on both frontend and backend
- Consider API versioning (/api/v1/...)

### Testing Priorities
1. Critical user flows (logging workout, viewing history)
2. Data integrity (no orphaned records)
3. Authentication/authorization

## Current Status

Project is in initial planning and setup phase. No code has been written yet.

## Useful Commands

_(Will be populated as project develops)_

```bash
# Database
npm run db:migrate
npm run db:seed

# Development
npm run dev

# Testing
npm test
```

## Notes for Claude Code

- Prioritize simple, working solutions over perfect architecture
- When adding features, consider the database schema impact
- Always include TypeScript types
- Keep the UI simple and focused on speed of workout entry
- Remember: users will primarily interact with this in the gym on their phones
