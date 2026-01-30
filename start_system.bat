@echo off
echo ==========================================
echo    INICIANDO SISTEMA BICHINHO MIMADO
echo ==========================================

echo.
echo [1/3] Iniciando Servidor Backend (API)...
start "Bichinho Mimado - SERVER" cmd /k "cd server && npm install && npx prisma migrate deploy && node index.js"

echo.
echo [2/3] Aguardando API subir...
timeout /t 5

echo.
echo [3/3] Iniciando Frontend (Web)...
start "Bichinho Mimado - WEB" cmd /k "cd web && npm install && npm run dev"

echo.
echo ==========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo    Acesse: http://localhost:5173
echo ==========================================
pause
