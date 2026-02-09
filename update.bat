@echo off
setlocal enabledelayedexpansion

set "MESSAGE=%~1"
if "!MESSAGE!"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
    set "MESSAGE=pembaharuan kode: !dt:~0,4!-!dt:~4,2!-!dt:~6,2! !dt:~8,2!:!dt:~10,2!:!dt:~12,2!"
)

echo 🚀 Memulai proses update...

:: Add all changes
git add .

:: Commit with the message
git commit -m "!MESSAGE!"

:: Push to origin main
git push origin main

echo ✅ Selesai! Kode Anda sedang dideploy oleh GitHub Actions.
pause
