# Deployment Guide - Task Management System

This guide explains how to deploy the Task Management System using Vercel for the frontend and backend.

## Frontend Deployment (Vercel)

### Prerequisites
- A [Vercel](https://vercel.com) account
- [Git](https://git-scm.com/) installed
- Your project pushed to a GitHub repository

### Steps

1. **Prepare Your Frontend Project**
   ```bash
   cd frontend
   # Ensure all dependencies are installed
   npm install
   # Build locally to check for any issues
   npm run build
   ```

2. **Configure Environment Variables**
   Create a `.env.production` file with:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.vercel.app
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI if not already installed
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

   Or deploy using the Vercel Dashboard:
   1. Go to [vercel.com/new](https://vercel.com/new)
   2. Import your repository
   3. Select the frontend directory
   4. Configure environment variables
   5. Click "Deploy"

4. **Configure Project Settings**
   - Set the production domain
   - Add environment variables in Vercel dashboard
   - Configure build settings if needed

## Backend Deployment (Vercel)

### Prerequisites
- MongoDB Atlas account (for database)
- Vercel account
- Your project in a GitHub repository

### Steps

1. **Prepare MongoDB Atlas**
   1. Create a new cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   2. Set up database user and password
   3. Get your connection string
   4. Whitelist IP addresses (0.0.0.0/0 for all IPs)

2. **Prepare Backend for Vercel**
   Create a `vercel.json` in the backend directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/main.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/main.ts",
         "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Configure Environment Variables**
   Add these variables in Vercel dashboard:
   ```env
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRATION=24h
   PORT=443
   ```

4. **Deploy Backend to Vercel**
   ```bash
   cd backend
   vercel
   ```

   Or using Vercel Dashboard:
   1. Go to vercel.com/new
   2. Import your repository
   3. Select the backend directory
   4. Configure environment variables
   5. Deploy

5. **Enable WebSocket Support**
   - Go to your project settings in Vercel
   - Enable "Functions" and "WebSocket"
   - Update frontend WebSocket URL accordingly

## Post-Deployment Steps

1. **Update Frontend Configuration**
   Update the frontend environment variables with your new backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.vercel.app
   ```

2. **Verify Deployment**
   - Test authentication
   - Verify WebSocket connections
   - Check real-time notifications
   - Test task creation and updates

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration includes frontend domain
   - Check protocol (http/https) matches

2. **WebSocket Connection Issues**
   - Ensure WSS (WebSocket Secure) is used for HTTPS sites
   - Verify Vercel WebSocket function is enabled

3. **MongoDB Connection Issues**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string is correct
   - Ensure environment variables are set

4. **API Errors**
   - Check API URL configuration
   - Verify environment variables are set correctly
   - Check Vercel deployment logs

## Monitoring and Maintenance

1. **Setup Monitoring**
   - Enable Vercel Analytics
   - Set up MongoDB Atlas monitoring
   - Configure error tracking (e.g., Sentry)

2. **Regular Maintenance**
   - Monitor error logs
   - Check performance metrics
   - Update dependencies regularly
   - Backup database periodically

## Security Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Rotate secrets periodically
   - Never commit secrets to Git

2. **Authentication**
   - Implement rate limiting
   - Use secure session management
   - Enable HTTPS only

3. **Database**
   - Regular security updates
   - Implement backup strategy
   - Monitor access logs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [NestJS Deployment Guide](https://docs.nestjs.com/fundamentals/deployment)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)