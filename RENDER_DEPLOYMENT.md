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
   ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS

   # Security Configuration
   PASSWORD_SALT_ROUNDS=12
   ```

5. Important Settings:
   - Make sure PORT is set to 10000
   - Ensure MONGODB_URI is the complete connection string
   - Double-check that all environment variables are set

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

## Troubleshooting Guide

### MongoDB Connection Issues

If you see the error: "Could not connect to any servers in your MongoDB Atlas cluster":

1. Check IP Whitelist:
   - Go to MongoDB Atlas Dashboard
   - Network Access section
   - Ensure 0.0.0.0/0 is in the IP whitelist
   - If not, add it and wait 1-2 minutes for propagation

2. Verify Connection String:
   - Check MONGODB_URI format
   - Ensure username and password are URL encoded
   - Verify database name is correct

3. Check Database User:
   - Confirm user has proper permissions
   - Try recreating database user if issues persist

### Port Binding Issues

If you see "No open ports detected":

1. Verify in main.ts:
   - Port is set to process.env.PORT
   - Listen address is set to '0.0.0.0'

2. Check Environment Variables:
   - PORT is set to 10000
   - No conflicting port settings

### Deployment Logs

To check deployment logs:

1. Go to your Web Service in Render
2. Click on "Logs" in the left menu
3. Look for specific error messages
4. Check "System" logs for infrastructure issues
5. Check "Deploy" logs for build problems

## Monitoring and Verification

1. After Deployment:
   - Watch logs for successful startup
   - Verify database connection
   - Test API endpoints

2. Health Checks:
   - Monitor application logs
   - Check for error messages
   - Verify WebSocket connections

## Security Reminders

1. Environment Variables:
   - Use strong JWT secrets
   - Keep MongoDB credentials secure
   - Update CORS settings appropriately

2. Database Security:
   - Regular backups
   - Monitor access logs
   - Update user passwords periodically

## Additional Resources

- [Render Deployment Docs](https://render.com/docs/deploy-node-express-app)
- [MongoDB Atlas Security Checklist](https://docs.atlas.mongodb.com/security-checklist/)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)

Remember to always check the deployment logs in Render dashboard if you encounter any issues. They provide valuable information about what might be going wrong during the deployment process.