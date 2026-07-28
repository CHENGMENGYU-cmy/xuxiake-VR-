@echo off
cd /d "%~dp0server"
set NODE_OPTIONS=--max-old-space-size=4096
npm run start:dev
