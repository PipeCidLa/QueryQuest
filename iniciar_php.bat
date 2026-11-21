@echo off
cd /d "%~dp0"
if not exist "C:\xampp\php\php.exe" (
  echo No se encontro PHP en C:\xampp\php. Revisa la ruta de XAMPP.
  pause
  exit /b 1
)
echo QueryQuest: abre http://127.0.0.1:8080
echo Deja esta ventana abierta mientras usas la pagina. Ctrl+C detiene el servidor.
"C:\xampp\php\php.exe" -d display_errors=0 -d log_errors=1 -S 127.0.0.1:8080 -t public server/php/router.php
pause
