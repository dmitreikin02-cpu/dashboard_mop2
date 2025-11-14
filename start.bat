@echo off
chcp 65001 >nul
title Производственный Дашборд - Сервер

REM Включаем delayed expansion ПОСЛЕ echo с восклицательными знаками
echo ╔════════════════════════════════════════════════╗
echo ║   Запуск Производственного Дашборда           ║
echo ╚════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

REM Проверка наличия портативного Node.js
if not exist "node\node.exe" (
    echo ❌ ОШИБКА: Портативный Node.js не найден!
    pause
    exit /b 1
)

REM Проверка наличия dashboard.html
if not exist "dashboard.html" (
    echo ❌ ОШИБКА: dashboard.html не найден!
    pause
    exit /b 1
)

REM Проверка наличия server.js
if not exist "server.js" (
    echo ❌ ОШИБКА: server.js не найден!
    pause
    exit /b 1
)

REM Проверка наличия Excel файла
set EXCEL_FOUND=0
for %%f in (*.xlsx) do (
    set EXCEL_FOUND=1
    goto :excel_check_done
)
:excel_check_done

if !EXCEL_FOUND! EQU 0 (
    echo ⚠️  ПРЕДУПРЕЖДЕНИЕ: Excel файл (.xlsx^) не найден!
    pause
)

echo ✅ Все файлы найдены
echo.
echo 🚀 Запуск сервера...
echo.

REM Запуск Node.js сервера
node\node.exe server.js

pause