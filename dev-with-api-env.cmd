@echo off
setlocal
for /f "tokens=*" %%a in (C:\Project\ExAi\apps\api\.env) do (
  set "%%a"
)
cd /d C:\Project\ExAi
call .\node_modules\.bin\pnpm.cmd dev %*
