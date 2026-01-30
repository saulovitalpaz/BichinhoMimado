@echo off
echo ==========================================
echo    INICIANDO SISTEMA BICHINHO MIMADO
echo ==========================================

:: Backend
echo.
echo [1/2] Verificando e Iniciando Backend...
cd server
if not exist node_modules (
    echo Instalando dependencias do Servidor...
    call npm install && call npx prisma generate && call npx prisma db push
)
start "Bichinho Mimado - SERVER" cmd /k "node index.js"
cd ..

:: Wait a bit
timeout /t 2 > nul

:: Frontend
echo.
echo [2/2] Verificando e Iniciando Frontend...
cd web
if not exist node_modules (
    echo Instalando dependencias do Web...
    call npm install
)
start "Bichinho Mimado - WEB" cmd /k "npm run dev"
cd ..

echo.
echo ==========================================
echo    SISTEMA PRONTO!
echo    Acesse: http://localhost:5173
echo ==========================================
timeout /t 5
