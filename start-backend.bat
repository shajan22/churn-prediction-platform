@echo off
echo ========================================
echo Churn Prediction Platform - Backend Start
echo ========================================
echo.

cd server

if not exist venv\Scripts\activate.bat (
    echo [ERROR] Virtual environment not found! 
    echo Please run setup-all.bat first to install dependencies.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting Flask server...
python app.py

pause
