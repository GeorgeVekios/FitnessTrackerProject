# Setup Guide

This guide will help you set up and run the Fitness Tracker application locally.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Google OAuth Credentials** (for authentication)

## Step 1: Clone and Install

```bash
# Clone the repository (if from git)
git clone <repository-url>
cd FitnessTrackerProject

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up PostgreSQL

1. Install PostgreSQL if you haven't already:
   ```bash
   # macOS with Homebrew
   brew install postgresql@14
   brew services start postgresql@14

   # Or use Docker
   docker run --name fitness-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
   ```

2. Create the database:
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE fitness_tracker;

   # Exit psql
   \q
   ```

## Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
7. Copy your Client ID and Client Secret

## Step 4: Configure Environment Variables

### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update the following:

```env
# Database - update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/fitness_tracker?schema=public"

# Google OAuth - paste your credentials
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Session Secret - generate a random string
SESSION_SECRET=your_random_secret_key_here
```

To generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

The frontend `.env` is already created with default values. No changes needed for local development.

## Step 5: Set Up Database Schema

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database with initial data
# npm run db:seed
```

## Step 6: Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Step 7: Test the Application

1. Open your browser and go to http://localhost:3000
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to the dashboard

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `brew services list` or `docker ps`
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql postgresql://username:password@localhost:5432/fitness_tracker`

### Google OAuth Issues

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
- Check that redirect URI matches exactly: `http://localhost:3001/api/auth/google/callback`
- Ensure Google+ API is enabled in Google Cloud Console

### Port Already in Use

If port 3001 or 3000 is already in use:
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill
lsof -ti:3000 | xargs kill
```

## Useful Commands

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Next Steps

- Start building workout logging features
- Add exercise library
- Implement progress tracking
- Build charts and analytics

## Need Help?

Check the [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details and development guidelines.
