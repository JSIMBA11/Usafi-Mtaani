@echo off
echo Starting EcoRewards Application...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" node index.js

echo.
echo Starting Frontend Server...
cd ..\frontend
timeout /t 3 /nobreak >nul
start "Frontend Server" npm run dev

echo.
echo Both servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul