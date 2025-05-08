# Deploying Task Management System on Render

## Prerequisites
- A [Render](https://render.com) account
- MongoDB Atlas account
- Git repository with your code

## 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster:
   ```
   a. Go to MongoDB Atlas Dashboard
   b. Create new cluster (free tier works)
   c. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   d. Database Access → Add Database User
   e. Get your connection string
   ```

## 2. Backend Deployment

1. Create a new Web Service:
   - Connect your repository
   - Root Directory: `backend`
   - Build Command: `npm ci && npx @nestjs/cli build`
   - Start Command: `node dist/main.js`
   - Node Version: 18.17.0 (set in .node-version)

2. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_uri
   MONGODB_USER=your_user
   MONGODB_PASS=your_password
   JWT_SECRET=your_secure_32_char_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW=3600000
   RATE_LIMIT_MAX_REQUESTS=100
   LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
   PASSWORD_SALT_ROUNDS=12
   ```

3. Verify Deployment:
   ```bash
   # Check if server is running
   curl https://your-backend-url.onrender.com/health
   ```

## 3. Frontend Deployment

1. Create a new Web Service:
   - Connect your repository
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Node Version: >=18.17.0 (set in package.json)

2. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   ```

3. Verify Deployment:
   ```bash
   # Check frontend health
   curl https://your-frontend-url.onrender.com/api/health
   ```

## 4. Post-Deployment Steps

1. Update Backend CORS:
   - Go to backend service settings
   - Update ALLOWED_ORIGINS with frontend URL
   - Redeploy backend service

2. Test Connections:
   ```bash
   # Backend Health
   curl https://your-backend-url.onrender.com/health

   # Frontend Health
   curl https://your-frontend-url.onrender.com/api/health

   # API Connection
   curl https://your-backend-url.onrender.com/api/tasks
   ```

## Troubleshooting

1. Connection Issues:
   ```bash
   # Check backend logs
   render logs your-backend-service

   # Check frontend logs
   render logs your-frontend-service
   ```

2. Build Failures:
   - Check Node.js version (18.17.0)
   - Verify all dependencies are in package.json
   - Check build command outputs

3. Runtime Errors:
   - Verify environment variables
   - Check MongoDB connection
   - Verify CORS settings

4. TypeScript Errors:
   - Check tsconfig.json settings
   - Verify types are properly imported
   - Check for missing type definitions

## Security Checklist

1. MongoDB Atlas:
   - Strong password for database user
   - IP whitelist configured
   - Monitor access logs

2. Environment Variables:
   - All sensitive data in env vars
   - Different values for production
   - Secure JWT secret

3. CORS Settings:
   - Specific origins only
   - Proper methods configured
   - Credentials handled correctly

## Monitoring

1. Set Up Alerts:
   - Backend service health
   - Frontend service health
   - MongoDB Atlas metrics
   - Error rate monitoring

2. Regular Checks:
   - Review error logs
   - Monitor performance
   - Check resource usage
   - Verify backups

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NestJS Production Guide](https://docs.nestjs.com/techniques/performance)

For any issues, check the deployment logs in your Render dashboard and ensure all environment variables are properly set.