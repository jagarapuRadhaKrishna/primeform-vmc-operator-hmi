# Deployment Guide - Primeform VMC Operator HMI

This guide explains how to deploy the Primeform VMC Operator HMI with separate Railway (backend) and Vercel (frontend) deployments from the same GitHub repository.

## Architecture

```
GitHub Repository: primeform-vmc-operator-hmi
├── client/    → Vercel (Frontend)
└── server/    → Railway (Backend)
```

## Railway Deployment (Backend)

### Repository Settings
- **Repository**: `jagarapuRadhaKrishna/primeform-vmc-operator-hmi`
- **Root Directory**: `/server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables
Add these environment variables in your Railway dashboard:

```bash
# MySQL Database (Railway provides these automatically when you add a MySQL service)
MYSQLHOST=your-mysql-host.railway.app
MYSQLPORT=3306
MYSQLUSER=your-mysql-user
MYSQLPASSWORD=your-mysql-password
MYSQLDATABASE=your-database-name

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS - Your Vercel frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

### Database Setup
1. Add a MySQL service in Railway
2. Railway will automatically provide the `MYSQL*` environment variables
3. The application will automatically initialize the database schema and seed data on first run

### Health Check
- The backend includes a health check endpoint: `https://your-backend.up.railway.app/api/health`
- Railway will use this to monitor service health

## Vercel Deployment (Frontend)

### Repository Settings
- **Repository**: `jagarapuRadhaKrishna/primeform-vmc-operator-hmi`
- **Root Directory**: `/client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
Add this environment variable in your Vercel project settings:

```bash
# Your Railway backend URL
VITE_API_URL=https://your-backend.up.railway.app
```

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "feat: configure for Railway and Vercel deployment"
git push origin main
```

### 2. Deploy Backend to Railway
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect GitHub repository: `jagarapuRadhaKrishna/primeform-vmc-operator-hmi`
4. Set root directory to: `/server`
5. Add a MySQL service to the project
6. Configure environment variables (Railway will auto-populate MySQL variables)
7. Set `FRONTEND_URL` to your Vercel frontend URL (after Vercel deployment)
8. Deploy

### 3. Deploy Frontend to Vercel
1. Go to [Vercel](https://vercel.com)
2. Create a new project
3. Connect GitHub repository: `jagarapuRadhaKrishna/primeform-vmc-operator-hmi`
4. Set root directory to: `/client`
5. Add `VITE_API_URL` environment variable with your Railway backend URL
6. Deploy

### 4. Update CORS Settings
After both deployments are complete:
1. Get your Vercel frontend URL
2. Update the `FRONTEND_URL` environment variable in Railway
3. Redeploy the Railway backend

## Local Development

### Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your local MySQL settings
npm install
npm start
```

### Frontend Setup
```bash
cd client
cp .env.example .env
# Edit .env with your local backend URL
npm install
npm run dev
```

## Environment Variable Reference

### Server (Railway)
- `MYSQLHOST` - MySQL host (Railway provides)
- `MYSQLPORT` - MySQL port (Railway provides)
- `MYSQLUSER` - MySQL user (Railway provides)
- `MYSQLPASSWORD` - MySQL password (Railway provides)
- `MYSQLDATABASE` - Database name (Railway provides)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (production/development)
- `FRONTEND_URL` - Frontend URL for CORS (your Vercel URL)

### Client (Vercel)
- `VITE_API_URL` - Backend API URL (your Railway URL)

## Troubleshooting

### Backend fails to start
- Check that all MySQL environment variables are set
- Verify MySQL service is running in Railway
- Check Railway build logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that `FRONTEND_URL` in Railway matches your Vercel domain
- Ensure CORS is configured correctly

### Database initialization fails
- Check MySQL connection settings
- Verify database user has proper permissions
- Check Railway logs for database errors

## API Endpoints

The backend provides the following endpoints:

- `GET /api/health` - Health check
- `GET /api/machine` - Get machine configuration
- `GET /api/workflow` - Get workflow state
- `POST /api/checks/:id/confirm` - Confirm machine check
- `POST /api/tools/:id/confirm` - Confirm tool
- `POST /api/workpiece/:id/confirm` - Confirm workpiece step
- `POST /api/workflow/next` - Advance to next stage
- `POST /api/operation/start` - Start operation
- `POST /api/operation/stop` - Stop operation
- `POST /api/workflow/reset` - Reset system

## Notes

- The backend automatically initializes the database schema and seeds data on first run
- No migration scripts are needed - the database is self-initializing
- The frontend uses Vite for development and optimized production builds
- Both deployments support automatic builds from GitHub commits
- Environment variables should never be committed to the repository