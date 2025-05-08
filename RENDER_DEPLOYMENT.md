# Deploying Task Management System to Render

## Prerequisites
- A [Render](https://render.com) account
- MongoDB Atlas account (for database)
- Your project in a Git repository

## Step 1: Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier works)
   - Set up database access user
   - Get your connection string
   - Whitelist IP addresses (0.0.0.0/0 for all IPs)

2. Note down your MongoDB URI

## Step 2: Backend Deployment

1. Log in to [Render Dashboard](https://dashboard.render.com)

2. Create a New Web Service:
   - Click "New +" > "Web Service"
   - Connect your Git repository
   - Select the backend directory

3. Configure the service:
   - Name: `task-management-backend` (or your preference)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Select instance type (Free tier works for testing)

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   WS_CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

5. Click "Create Web Service"

## Step 3: Frontend Deployment

1. In Render Dashboard, create another Web Service:
   - Click "New +" > "Web Service"
   - Connect your Git repository
   - Select the frontend directory

2. Configure the service:
   - Name: `task-management-frontend` (or your preference)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Select instance type (Free tier works for testing)

3. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   ```

4. Click "Create Web Service"

## Step 4: Post-Deployment Steps

1. Update CORS Configuration:
   - Ensure backend's ALLOWED_ORIGINS includes your frontend Render URL
   - Check WebSocket configuration is correct

2. Verify Deployment:
   - Test user registration/login
   - Create and manage tasks
   - Check real-time notifications
   - Verify WebSocket connections

## Troubleshooting Common Issues

1. **Connection Issues**:
   - Verify environment variables are set correctly
   - Check MongoDB connection string
   - Ensure CORS origins match exactly

2. **WebSocket Problems**:
   - Make sure WSS (WebSocket Secure) is used
   - Check WS_CORS_ORIGIN configuration
   - Verify frontend WebSocket URL

3. **Build Failures**:
   - Check Render logs for errors
   - Verify all dependencies are listed in package.json
   - Ensure build commands are correct

## Security Best Practices

1. **Environment Variables**:
   - Never commit .env files to Git
   - Use strong, unique secrets
   - Rotate sensitive credentials periodically

2. **Database**:
   - Use strong MongoDB Atlas passwords
   - Enable database backups
   - Monitor database access logs

3. **API Security**:
   - Keep dependencies updated
   - Enable rate limiting
   - Use HTTPS only

## Monitoring

1. Set up Render monitoring:
   - Enable logs monitoring
   - Configure error notifications
   - Monitor resource usage

2. Database monitoring:
   - Use MongoDB Atlas monitoring
   - Set up alerts for unusual activity
   - Monitor performance metrics

## Maintenance

1. Regular tasks:
   - Update dependencies monthly
   - Monitor error logs
   - Check resource usage
   - Backup database regularly

2. Performance optimization:
   - Monitor response times
   - Optimize database queries
   - Cache frequently accessed data

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)