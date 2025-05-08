<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Task Management System

A modern, responsive task management application built with Next.js 13 and NestJS, featuring real-time notifications and comprehensive task tracking capabilities.

## 🚀 Features

- User authentication and authorization
- Task creation, assignment, and management
- Real-time notifications
- Responsive design for mobile and desktop
- Task statistics and dashboard
- Overdue task tracking
- WebSocket integration for real-time updates

## 🛠 Tech Stack

### Frontend
- Next.js 13 (App Router)
- TypeScript
- TailwindCSS
- React Query
- WebSocket Client
- React Hook Form

### Backend
- NestJS
- MongoDB
- JWT Authentication
- WebSocket Server
- Rate Limiting
- API Documentation (Swagger)

## 📦 Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
PORT=3003
```

4. Start the development server:
```bash
npm run start:dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
```
## 🏗 Architecture & Design Decisions

### Frontend Architecture
- **App Router**: Utilizing Next.js 13's app router for improved routing and layouts
- **Server & Client Components**: Strategic use of server/client components for optimal performance
- **Custom Hooks**: Centralized business logic in reusable hooks
- **Context Providers**: Global state management for auth and notifications
- **Responsive Design**: Mobile-first approach with tailored experiences for different screen sizes

### Backend Architecture
- **Module-based Structure**: Separate modules for tasks, users, and auth
- **Repository Pattern**: Abstraction layer for database operations
- **Guards & Decorators**: Custom authentication and authorization handling
- **DTOs & Validation**: Strong type checking and request validation
- **WebSocket Gateway**: Real-time communication for notifications

## 💭 Implementation Details

### Authentication Flow
1. User signs up/logs in
2. JWT token issued and stored
3. Token used for API authentication
4. WebSocket connection established for real-time updates

### Task Management
- Tasks can be created, assigned, updated, and deleted
- Real-time status updates
- Automatic overdue detection
- Statistics calculation using MongoDB aggregations

### Notifications System
- WebSocket-based real-time notifications
- Different notification types (task assigned, overdue, status update)
- Notification badge with unread count
- Smooth animations and transitions

## 🤔 Assumptions & Trade-offs

### Assumptions
1. Users have modern browsers supporting WebSocket
2. MongoDB is preferred for flexibility and real-time capabilities
3. Single timezone handling (using system timezone)
4. Users have stable internet connection for real-time features

### Trade-offs
1. **Client-side State**: 
   - Pro: Better real-time updates
   - Con: Increased client-side complexity

2. **WebSocket Usage**:
   - Pro: Real-time updates
   - Con: Increased server load

3. **MongoDB Choice**:
   - Pro: Flexible schema, good for rapid development
   - Con: Less strict data integrity compared to SQL

4. **JWT Authentication**:
   - Pro: Stateless, scalable
   - Con: Can't invalidate tokens immediately

## 🔄 Future Improvements

1. **Performance**
   - Implement pagination for large data sets
   - Add caching layer
   - Optimize WebSocket connections

2. **Features**
   - Task comments and attachments
   - Advanced filtering and search
   - Task templates
   - Team management

3. **Technical**
   - Add end-to-end testing
   - Implement refresh tokens
   - Add offline support
   - Implement rate limiting

## 📝 License

MIT License - feel free to use this project for your own purposes.
