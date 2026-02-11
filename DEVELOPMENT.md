# Development Guide

## Project Structure

_(To be defined as project develops)_

Proposed structure:
```
fitness-tracker/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── shared/
    └── types/
```

## Development Workflow

### Initial Setup

1. **Backend Setup**
   - Initialize Node.js + TypeScript project
   - Set up PostgreSQL database
   - Configure Prisma ORM
   - Implement Google OAuth
   - Create initial API endpoints

2. **Frontend Setup**
   - Initialize React + TypeScript project
   - Set up routing
   - Implement auth flow
   - Create basic UI components

3. **Database Schema**
   - Design and implement initial schema
   - Create seed data for exercise library
   - Set up migrations

### Feature Development Process

1. Start with database schema (if new entities needed)
2. Build API endpoints with validation
3. Create frontend components
4. Test the complete flow
5. Iterate based on UX

## Key Technical Decisions

### State Management
- Start simple with React hooks (useState, useContext)
- Consider Zustand or Redux if complexity grows
- Server state: React Query for data fetching/caching

### Form Handling
- React Hook Form for workout logging forms
- Zod for validation schemas (shared with backend)

### Date/Time Handling
- Use date-fns or Day.js (lighter than Moment.js)
- Store timestamps in UTC, display in user's timezone

### Charts & Visualization
- Recharts or Chart.js for progress charts
- Keep it simple - line charts for progress, bar charts for volume

## API Design

### Authentication
```
POST   /api/auth/google          # Initiate Google OAuth
GET    /api/auth/google/callback # OAuth callback
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Get current user
```

### Workouts
```
GET    /api/workouts             # List user's workouts
POST   /api/workouts             # Create new workout
GET    /api/workouts/:id         # Get workout details
PUT    /api/workouts/:id         # Update workout
DELETE /api/workouts/:id         # Delete workout
```

### Exercises
```
GET    /api/exercises            # List all exercises
GET    /api/exercises/:id        # Get exercise details
POST   /api/exercises            # Create custom exercise
```

### Templates
```
GET    /api/templates            # List user's templates
POST   /api/templates            # Create template
GET    /api/templates/:id        # Get template
PUT    /api/templates/:id        # Update template
DELETE /api/templates/:id        # Delete template
```

### Analytics
```
GET    /api/analytics/progress   # Progress data for charts
GET    /api/analytics/prs        # Personal records
GET    /api/analytics/volume     # Volume over time
```

## Database Schema (Preliminary)

### Users
- id (UUID, primary key)
- google_id (unique)
- email
- name
- profile_picture_url
- created_at
- updated_at

### Exercises
- id (UUID, primary key)
- name
- description
- category (strength, cardio, flexibility, etc.)
- muscle_groups (array or JSONB)
- equipment (barbell, dumbbell, bodyweight, etc.)
- instructions
- is_custom (boolean - user-created vs. system)
- user_id (nullable - null for system exercises)
- created_at

### Workouts
- id (UUID, primary key)
- user_id (foreign key)
- name
- date (timestamp)
- notes
- duration_minutes
- created_at
- updated_at

### Sets
- id (UUID, primary key)
- workout_id (foreign key)
- exercise_id (foreign key)
- set_number
- reps
- weight
- weight_unit (lbs, kg)
- notes
- created_at

### Templates
- id (UUID, primary key)
- user_id (foreign key)
- name
- description
- exercises (JSONB - array of {exercise_id, default_sets, default_reps})
- created_at
- updated_at

### PersonalRecords
- id (UUID, primary key)
- user_id (foreign key)
- exercise_id (foreign key)
- weight
- weight_unit
- reps
- date
- created_at

## Security Considerations

- Validate all user input
- Use parameterized queries (Prisma handles this)
- Ensure users can only access their own data
- Secure OAuth tokens (httpOnly cookies)
- Rate limiting on API endpoints
- CORS configuration for production

## Performance Considerations

- Index foreign keys and frequently queried fields
- Paginate workout history (don't load all workouts at once)
- Cache exercise library (rarely changes)
- Optimize chart queries (aggregate in database, not application)
- Consider Redis for session storage (future)

## Testing Strategy

### Backend
- Unit tests for business logic
- Integration tests for API endpoints
- Test authentication middleware

### Frontend
- Component tests for UI components
- Integration tests for user flows
- E2E tests for critical paths (login, log workout, view history)

## Deployment

_(To be determined - likely Vercel/Railway/Render for simplicity)_
