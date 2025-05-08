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

## Step 2: Backend Deployment

1. Log in to [Render Dashboard](https://dashboard.render.com)

2. Create a New Web Service:
   - Click "New +" > "Web Service"
   - Connect your Git repository
   - Select the backend directory

3. Configure the service:
   - Name: `task-management-backend` (or your preference)
   - Environment: `Node`
   - Build Command: `npm install && npx @nestjs/cli build`
   - Start Command: `node dist/main.js`
   - Select instance type (Free tier works for testing)
   - Set Root Directory to: `backend`

4. Add Required Environment Variables:
   ```env
   # Server Configuration
   NODE_ENV=production
   PORT=10000

   # MongoDB Configuration (update with your values)
   MONGODB_URI=mongodb+srv://your-connection-string
   MONGODB_USER=your_mongodb_username
   MONGODB_PASS=your_mongodb_password

   # JWT Configuration (use secure values)
   JWT_SECRET=generate-a-secure-32-char-min-secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW=3600000
   RATE_LIMIT_MAX_REQUESTS=100
   LOGIN_RATE_LIMIT_WINDOW=3600000
   LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5

   # CORS Configuration (update after frontend deployment)
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com

   # Security Configuration
   PASSWORD_SALT_ROUNDS=12
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
   - Set Root Directory to: `frontend`

3. Add Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   ```

## Step 4: Post-Deployment Configuration

1. After frontend deployment:
   - Copy the frontend URL
   - Go to backend service settings
   - Update ALLOWED_ORIGINS with the frontend URL

2. Update frontend environment variables:
   - Copy the backend URL
   - Update NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL

## Troubleshooting Common Issues

1. **Environment Variable Errors**:
   If you see errors like "MONGODB_USER is required":
   - Check all required variables are set in Render dashboard
   - Verify variable names match exactly
   - Ensure no trailing spaces in values

2. **MongoDB Connection Issues**:
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check connection string is correct
   - Verify database user credentials

3. **CORS Errors**:
   - Ensure ALLOWED_ORIGINS matches frontend URL exactly
   - Include protocol (https://) in URL
   - Remove any trailing slashes

4. **Build Issues**:
   - Check build logs for errors
   - Verify root directory settings
   - Ensure all dependencies are in package.json

## Security Best Practices

1. **Environment Variables**:
   - Use strong, unique values for JWT_SECRET
   - Never commit .env files
   - Use different values for production and development

2. **Database Security**:
   - Use strong MongoDB passwords
   - Regular backups
   - Monitor access logs

3. **API Security**:
   - Enable rate limiting
   - Use HTTPS only
   - Keep dependencies updated

## Monitoring

1. Set up Render monitoring:
   - Enable logs monitoring
   - Configure error notifications
   - Monitor resource usage

2. Database monitoring:
   - Use MongoDB Atlas monitoring
   - Set up alerts
   - Monitor performance metrics

## Maintenance

1. Regular tasks:
   - Update dependencies
   - Monitor error logs
   - Check resource usage

2. Performance:
   - Monitor response times
   - Check database queries
   - Review API endpoints

## Generating Secure Values

1. Generate JWT Secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Test your deployment:
   - Register a new user
   - Create and manage tasks
   - Test real-time updates
   - Verify WebSocket connections

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)