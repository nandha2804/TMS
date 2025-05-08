# Task Management System

A full-stack task management application built with Next.js and NestJS, featuring authentication, role-based access control, and real-time updates.

## Features

- User Authentication & Authorization
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Protected routes and API endpoints

- Task Management
  - Create, read, update, and delete tasks
  - Assign tasks to users
  - Set priority and due dates
  - Track task status
  - Recurring tasks support
  - Task filtering and search

- User Interface
  - Responsive design
  - Dashboard with task statistics
  - Task lists with sorting and filtering
  - Toast notifications
  - Loading states and error handling

## Tech Stack

### Backend
- NestJS - Node.js framework
- MongoDB with Mongoose - Database
- Passport.js - Authentication
- JWT - Token-based auth
- bcrypt - Password hashing

### Frontend
- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- React Hot Toast
- React Context API

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system
```

2. Set up the backend:
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update the .env file with your configuration
# Edit MONGODB_URI, JWT_SECRET, etc.

# Start the development server
npm run start:dev

# Optional: Seed the database with test data
npm run seed
```

3. Set up the frontend:
```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Update the API URL if needed
# NEXT_PUBLIC_API_URL=http://localhost:3003

# Start the development server
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3003

## Test Accounts (After running seed script)

```
Admin User:
Email: admin@example.com
Password: admin123

Regular User:
Email: user@example.com
Password: user123
```

## API Documentation

### Authentication Endpoints
- POST /auth/register - Register new user
- POST /auth/login - User login
- GET /auth/profile - Get current user profile

### Task Endpoints
- GET /tasks - Get all tasks
- POST /tasks - Create new task
- GET /tasks/:id - Get task by ID
- PATCH /tasks/:id - Update task
- DELETE /tasks/:id - Delete task
- GET /tasks/my-tasks - Get user's tasks
- GET /tasks/stats - Get task statistics
- GET /tasks/overdue - Get overdue tasks

## Folder Structure

```
task-management-system/
├── backend/
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── tasks/       # Tasks module
│   │   ├── users/       # Users module
│   │   └── ...
│   ├── test/           # Test files
│   └── ...
└── frontend/
    ├── src/
    │   ├── app/        # Next.js pages
    │   ├── components/ # React components
    │   ├── contexts/   # React contexts
    │   ├── hooks/      # Custom hooks
    │   ├── types/      # TypeScript types
    │   └── utils/      # Utility functions
    └── ...
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests

# Frontend tests
cd frontend
npm run test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Deployment

### Backend
1. Build the application:
```bash
cd backend
npm run build
```

2. Start the production server:
```bash
npm run start:prod
```

### Frontend
1. Build the application:
```bash
cd frontend
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.