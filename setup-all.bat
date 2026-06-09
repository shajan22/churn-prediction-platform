@echo off
echo ========================================
echo Churn Prediction Platform - Setup
echo ========================================
echo.

echo Setting up Backend...
cd server
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing backend dependencies...
pip install -r requirements.txt
cd ..

echo.
echo Setting up Frontend...
cd client
echo Installing frontend dependencies...
call npm install
cd ..

echo.
echo ========================================
echo Setup Complete!
echo You can now run start-backend.bat and start-frontend.bat
echo ========================================
pause
