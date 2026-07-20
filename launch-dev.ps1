# Launches the dev server fully detached
$ErrorActionPreference = "SilentlyContinue"

$envFile = "C:\Project\ExAi\apps\api\.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -Match "^([^#][^=]+)=(.*)$") {
      $name = $Matches[1]
      $value = $Matches[2]
      [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

Set-Location -LiteralPath "C:\Project\ExAi"
& .\node_modules\.bin\pnpm.cmd dev > big.log 2> bigerr.log
