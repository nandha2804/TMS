# Deploying Task Management System to Render

## Prerequisites
- A [Render](https://render.com) account
- MongoDB Atlas account (for database)
- Your project in a Git repository

## Step 1: MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster:
   ```
   a. Go to MongoDB Atlas Dashboard
   b. Create a new cluster (free tier works)
   c. Go to Network Access in the security menu
   d. Click "+ ADD IP ADDRESS"
   e. Click "ALLOW ACCESS FROM ANYWHERE" (adds 0.0.0.0/0)
   f. Click Confirm
   ```

2. Create Database User:
   ```
   a. Go to Database Access
   b. Click "+ ADD NEW DATABASE USER"
   c. Choose Password authentication
   d. Enter username and password
   e. Set Built-in Role to "Atlas admin"
   f. Click "Add User"
   ```

3. Get Connection String:
   ```
   a. Click "Connect" on your cluster
   b. Choose "Connect your application"
   c. Copy the connection string
   d. Replace <password> with your database user password
   ```

## Step 2: Backend Deployment

1. Log in to [Render Dashboard](https://dashboard.render.com)

2. Create a New Web Service:
   - Click "New +" > "Web Service"
   - Connect your Git repository
   - Select the backend directory

3. Configure the service:
   ```
   Name: task-management-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npx @nestjs/cli build
   Start Command: node dist/main.js
   Auto-Deploy: Yes
   ```

4. Add Required Environment Variables:
   ```env
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
   LOGIN_RATE_LIMIT_WINDOW=3600000
   LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
   PASSWORD_SALT_ROUNDS=12
   ```

## Step 3: Frontend Deployment

1. In Render Dashboard, create another Web Service:
   - Click "New +" > "Web Service"
   - Connect your Git repository
   - Select the frontend directory

2. Configure the service:
   ```
   Name: task-management-frontend
   Root Directory: frontend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Auto-Deploy: Yes
   ```

3. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   ```

## Step 4: Verify Deployments

1. Backend Verification:
   ```
   a. Check deployment logs for successful build
   b. Verify MongoDB connection is established
   c. Test API endpoints using Postman or curl
   ```

2. Frontend Verification:
   ```
   a. Check build logs for successful compilation
   b. Visit the frontend URL
   c. Test user registration and login
   d. Verify task creation and management
   ```

## Troubleshooting Common Issues

### 1. Backend Build Issues
If you see TypeScript errors:
- Check main.ts helmet import is correct
- Verify tsconfig.json has proper settings
- Ensure all dependencies are in package.json

### 2. Frontend Build Issues
If you encounter Next.js build errors:
- Check page.tsx files for correct prop types
- Verify all dynamic routes have proper typing
- Ensure environment variables are set correctly

### 3. Runtime Issues
If the application fails to start:
- Check MongoDB connection string
- Verify all required environment variables
- Ensure port configuration is correct
- Check CORS settings match frontend URL

### 4. Connection Issues
If frontend can't connect to backend:
- Verify API URLs are correct
- Check CORS configuration
- Ensure WebSocket URL is using wss://
- Verify network access in MongoDB Atlas

## Monitoring and Maintenance

1. Regular Checks:
   ```
   - Monitor error logs in Render dashboard
   - Check MongoDB Atlas metrics
   - Review application performance
   - Monitor API response times
   ```

2. Updates and Maintenance:
   ```
   - Keep dependencies updated
   - Review security alerts
   - Backup database regularly
   - Monitor resource usage
   ```

## Security Best Practices

1. Environment Variables:
   - Use strong JWT secrets
   - Rotate credentials regularly
   - Keep MongoDB credentials secure
   - Use different values for production

2. Database Security:
   - Regular backups
   - Monitor access logs
   - Update security patches
   - Review access patterns

3. Application Security:
   - Enable rate limiting
   - Use HTTPS only
   - Keep dependencies updated
   - Monitor for suspicious activity

## Additional Resources

- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [NestJS Production](https://docs.nestjs.com/techniques/performance)

For any issues, check the deployment logs in your Render dashboard and ensure all environment variables are properly set.