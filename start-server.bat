@echo off
echo ========================================
echo    Chiku Medicare - Local Server
echo ========================================
echo.
echo Server start ho raha hai...
echo Mobile se access karne ke liye:
echo   1. WiFi same network me ho PC aur mobile
echo   2. PC ka IP address note kare: ipconfig
echo   3. Mobile browser me open kare: http://[PC-IP-ADDRESS]:8080
echo.
echo Server band karne ke liye is window me Ctrl+C dabaye
echo ========================================
echo.

python -m http.server 8080 --bind 0.0.0.0