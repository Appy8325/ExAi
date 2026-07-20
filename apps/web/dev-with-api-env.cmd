@echo off
setlocal
set NO_COLOR=1
for /f "tokens=*" %%a in (C:\Project\ExAi\apps\api\.env) do (
  set "%%a"
)
cd /d C:\Project\ExAi\apps\web
call node_modules\.bin\next.cmd dev
