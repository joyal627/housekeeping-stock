@echo off
title Housekeeping Stock Count Server
echo ========================================================
echo Starting Housekeeping Stock Count Server...
echo ========================================================
start "" http://localhost:3000
node server.js
pause
