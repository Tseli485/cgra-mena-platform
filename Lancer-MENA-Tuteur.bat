@echo off
chcp 65001 >nul
title Plateforme MENA Tuteur
cd /d "%~dp0pwa"
echo ============================================================
echo   Plateforme MENA Tuteur - demarrage local securise
echo ============================================================
echo.
echo   Ouverture du navigateur sur http://localhost:8080
echo   (Laissez cette fenetre ouverte pendant l'utilisation.)
echo.
start "" "http://localhost:8080"
where py >nul 2>nul && (py -m http.server 8080) || (python -m http.server 8080)
