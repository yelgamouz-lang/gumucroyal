@echo off
REM Quick start script for GUMÜÇROYAL development environment
REM Run from project root (E-COM folder)

echo.
echo ===================================================
echo GUMÜÇROYAL — Development Environment Setup
echo ===================================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed. Please install Node.js 18+
    exit /b 1
)
echo ✓ Node.js is installed

REM Check Python
echo [2/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not installed. Please install Python 3.12+
    exit /b 1
)
echo ✓ Python is installed

REM Check PostgreSQL
echo [3/4] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: PostgreSQL client not found. Make sure PostgreSQL server is running.
)
echo ✓ PostgreSQL check complete

REM Frontend setup
echo [4/4] Setting up Frontend...
cd frontend
if not exist "node_modules\" (
    echo Installing dependencies (this may take a moment)...
    call npm install
) else (
    echo Dependencies already installed
)

if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_fb_id
        echo NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_tiktok_id
        echo NEXT_PUBLIC_SNAP_PIXEL_ID=your_snap_id
    ) > .env.local
    echo ✓ Created .env.local
)

cd ..

REM Backend setup
echo [5/5] Setting up Backend...
cd backend
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo ✓ Created venv
)

if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo APP_ENV=development
        echo DATABASE_URL=postgresql+psycopg2://gumucroyal:gumucroyal@localhost:5432/gumucroyal
        echo CORS_ORIGINS=["http://localhost:3000"]
        echo GOOGLE_SHEETS_WEBHOOK_URL=
        echo GOOGLE_SHEETS_WEBHOOK_SECRET=
        echo UPSELL_PRICE_MAD=69.0
    ) > .env.local
    echo ✓ Created .env.local
)

echo.
echo ===================================================
echo ✓ Setup Complete!
echo ===================================================
echo.
echo Next steps:
echo 1. Start PostgreSQL (if not running):
echo    docker run --name gumucroyal-db -e POSTGRES_DB=gumucroyal -e POSTGRES_USER=gumucroyal -e POSTGRES_PASSWORD=gumucroyal -p 5432:5432 -d postgres:16
echo.
echo 2. In one terminal, start Frontend:
echo    cd frontend && npm run dev
echo    → Available at http://localhost:3000
echo.
echo 3. In another terminal, start Backend:
echo    cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
echo    → Available at http://localhost:8000
echo.
echo 4. Test Backend health:
echo    curl http://localhost:8000/api/v1/health
echo.
echo 5. Check Frontend/Backend connection by opening:
echo    http://localhost:3000/collection
echo    (Should fetch products from backend)
echo.
