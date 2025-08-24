# DEVELOPMENT GUIDE - Chrome Recorder Test Management

## 🚨 CRITICAL DIRECTORY NAVIGATION RULES

### ⚠️ ALWAYS Navigate to Correct Directory First!

- **Backend (Laravel)**: `cd backend` → then run Laravel commands
- **Frontend (Next.js)**: `cd web-admin` → then run Node/npm commands

## 📁 PROJECT STRUCTURE

```
hkt-team-1/                    # ← Root directory
├── backend/                   # ← Laravel API Backend
│   ├── app/Models/           # ← Eloquent models
│   ├── app/Http/Controllers/ # ← API controllers
│   ├── database/migrations/  # ← Database schemas
│   ├── routes/api.php        # ← API routes
│   └── artisan              # ← Laravel CLI tool
├── web-admin/               # ← Next.js Frontend
│   ├── src/app/            # ← React pages
│   ├── src/lib/            # ← API client & utilities
│   └── package.json        # ← Node dependencies
└── memory-bank/            # ← Project documentation
```

## 🔧 DEVELOPMENT COMMANDS

### 🖥️ Backend Commands (Laravel API)

```bash
# 1. ALWAYS navigate to backend first
cd backend

# 2. Start development server
php artisan serve --port=8001
# ✅ API will run on: http://localhost:8001

# 3. Database operations
php artisan migrate              # Run migrations
php artisan db:seed             # Seed test data
php artisan migrate:refresh --seed  # Reset & seed

# 4. Generate code
php artisan make:model ModelName -mf
php artisan make:controller Api/ControllerName --api
php artisan make:request RequestName

# 5. View all routes
php artisan route:list

# 6. Clear caches (if issues)
php artisan cache:clear
php artisan config:clear
```

### 🌐 Frontend Commands (Next.js Admin)

```bash
# 1. ALWAYS navigate to web-admin first
cd web-admin

# 2. Install dependencies (first time)
npm install

# 3. Start development server
npm run dev
# ✅ Frontend will run on: http://localhost:3000

# 4. Production commands
npm run build     # Build for production
npm run start     # Start production server

# 5. Package management
npm install package-name    # Add dependency
npm uninstall package-name  # Remove dependency
```

## 🚀 DAILY DEVELOPMENT WORKFLOW

### Step 1: Start Backend API
```bash
# Terminal 1 (Backend)
cd backend
php artisan serve --port=8001
# Keep this terminal running
```

### Step 2: Start Frontend
```bash
# Terminal 2 (Frontend) 
cd web-admin
npm run dev
# Keep this terminal running
```

### Step 3: Access Applications
- **Frontend Admin**: http://localhost:3000
- **Backend API**: http://localhost:8001/api
- **API Documentation**: Use route:list or test with curl

## 📋 COMMON TASKS BY DIRECTORY

### In `/backend` Directory:

| Task | Command |
|------|---------|
| Start API server | `php artisan serve --port=8001` |
| Create new model | `php artisan make:model ModelName -mf` |
| Create API controller | `php artisan make:controller Api/ControllerName --api` |
| Run migrations | `php artisan migrate` |
| Seed database | `php artisan db:seed` |
| View all routes | `php artisan route:list` |
| Clear caches | `php artisan cache:clear` |

### In `/web-admin` Directory:

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Install packages | `npm install` |
| Add new package | `npm install package-name` |
| Build for production | `npm run build` |
| Start production | `npm run start` |

## 🧪 TESTING API ENDPOINTS

### Test with curl (from any directory):
```bash
# Test API authentication
curl -H "X-API-Key: ak_test_key_for_development" http://localhost:8001/api/projects

# Create a project
curl -X POST \
  -H "X-API-Key: ak_test_key_for_development" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"My test"}' \
  http://localhost:8001/api/projects
```

## 🔑 AUTHENTICATION

**API Key**: `ak_test_key_for_development`
- Used in frontend automatically
- Required for all API calls
- Shown in navigation bar

## 🎯 CURRENT STATUS

### ✅ Completed Features:
- **Backend**: Full CRUD API with authentication
- **Frontend**: Dashboard + Project management
- **Database**: All tables with relationships
- **Authentication**: API key system working

### 🔄 In Progress:
- Additional CRUD pages (Screens, Test Scripts, Tags, Results)
- Search and filtering functionality
- Enhanced UI/UX features

## 🚨 TROUBLESHOOTING

### "Could not open input file: artisan"
**Problem**: You're not in the `/backend` directory
**Solution**: `cd backend` first, then run artisan commands

### "npm command not found" or package.json errors
**Problem**: You're not in the `/web-admin` directory  
**Solution**: `cd web-admin` first, then run npm commands

### "Connection refused" API errors
**Problem**: Laravel server not running
**Solution**: `cd backend && php artisan serve --port=8001`

### Frontend can't connect to API
**Problem**: Backend not running or wrong port
**Solution**: Check backend is on port 8001, frontend expects localhost:8001

## 📝 FILE ORGANIZATION

### Backend Important Files:
- `backend/routes/api.php` - API endpoints
- `backend/app/Models/` - Database models
- `backend/app/Http/Controllers/Api/` - API controllers
- `backend/database/migrations/` - Database schemas

### Frontend Important Files:
- `web-admin/src/app/` - React pages
- `web-admin/src/lib/api.ts` - API client
- `web-admin/src/app/layout.tsx` - Main layout
- `web-admin/src/app/page.tsx` - Dashboard

Remember: **ALWAYS `cd` to the correct directory first!** 🎯
