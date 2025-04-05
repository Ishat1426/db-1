# DietBuddy Project Structure

## Project Overview

DietBuddy is a fitness and nutrition platform that helps users manage their diet, track workouts, and maintain their health and fitness goals. This document outlines the structure of the project to help developers understand the codebase organization.

## Directory Structure

The project is organized into two main directories:

```
DietBuddy/
├── frontend/             # React frontend application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── assets/       # Images, icons, etc.
│   │   ├── components/   # Reusable React components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   ├── styles/       # CSS and styling files
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Entry point
│   ├── index.html        # HTML template
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
├── backend/              # Node.js backend application
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose data models
│   ├── routes/           # API route definitions
│   ├── scripts/          # Utility scripts
│   ├── .env              # Environment variables
│   ├── .env.example      # Example environment file
│   ├── package.json      # Backend dependencies
│   └── server.js         # Server entry point
│
├── setup.ps1             # Windows setup script
├── setup.sh              # Unix setup script
└── .gitignore            # Git ignore file
```

## Key Features

- **User Authentication**: Registration, login, and profile management
- **Workout Programs**: Categorized by type and difficulty level
- **Meal Planning**: Browse meal options and create meal plans
- **Progress Tracking**: Track fitness and nutrition progress
- **Admin Dashboard**: Manage users, workouts, and meals

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/profile` - Get user profile

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/category/:category` - Get meals by category
- `GET /api/meals/type/:type` - Get meals by type
- `GET /api/meals/:id` - Get meal by ID
- `GET /api/meals/featured` - Get featured meals
- `GET /api/meals/search` - Search meals

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/category/:category` - Get workouts by category
- `GET /api/workouts/difficulty/:level` - Get workouts by difficulty
- `GET /api/workouts/difficulty/:category` - Get difficulty levels for category
- `GET /api/workouts/:id` - Get workout by ID

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- MongoDB (Local instance or MongoDB Atlas)

### Installation

#### Using Setup Scripts
Run the appropriate setup script for your operating system:

**Windows:**
```powershell
.\setup.ps1
```

**Unix/Linux/MacOS:**
```bash
chmod +x setup.sh
./setup.sh
```

#### Manual Setup
1. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update the MongoDB URI and other values

4. Seed the database:
   ```
   cd backend
   npm run seed
   ```

### Running the Application

From the backend directory, run both frontend and backend:
```
npm run dev:full
```

Or run them separately:
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

Access the application at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5007 