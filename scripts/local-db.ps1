param([string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin')
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$localDir = Join-Path $workspace '.local'
$cluster = Join-Path $localDir 'postgres'
New-Item -ItemType Directory -Path $localDir -Force | Out-Null
$envFile = Join-Path $workspace '.env.local'
if (!(Test-Path -LiteralPath $cluster)) {
  if (Test-Path -LiteralPath $envFile) { throw '.env.local already exists; configure DATABASE_URL or move this file before initializing a new local database.' }
  $password = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $passwordFile = Join-Path $localDir 'init-password'
  [IO.File]::WriteAllText($passwordFile, $password)
  try {
    & (Join-Path $PostgresBin 'initdb.exe') -D $cluster -U portfolio --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
  } finally { Remove-Item -LiteralPath $passwordFile -Force }
  $secret = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $settings = "DATABASE_URL=postgresql://portfolio:${password}@127.0.0.1:54329/portfolio`nNEXTAUTH_URL=http://localhost:3000`nNEXTAUTH_SECRET=$secret`nSITE_URL=http://localhost:3000`nGITHUB_USERNAME=MarouaneMess`nADMIN_GITHUB_USERNAME=MarouaneMess`nCONTACT_EMAIL=marouanemessafri3@gmail.com`n"
  [IO.File]::WriteAllText($envFile, $settings)
}
& (Join-Path $PostgresBin 'pg_ctl.exe') -D $cluster status | Out-Null
if ($LASTEXITCODE -ne 0) {
  $arguments = '-D "' + $cluster + '" -p 54329 -h 127.0.0.1'
  Start-Process -FilePath (Join-Path $PostgresBin 'postgres.exe') -ArgumentList $arguments -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localDir 'postgres-out.log') -RedirectStandardError (Join-Path $localDir 'postgres-error.log')
  Start-Sleep -Seconds 2
}
$line = Get-Content -LiteralPath $envFile | Where-Object { $_ -like 'DATABASE_URL=*' } | Select-Object -First 1
$uri = [uri]($line.Substring(13))
$env:PGPASSWORD = $uri.UserInfo.Split(':')[1]
try {
  $exists = & (Join-Path $PostgresBin 'psql.exe') -h 127.0.0.1 -p 54329 -U portfolio -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='portfolio'"
  if ($exists -ne '1') { & (Join-Path $PostgresBin 'createdb.exe') -h 127.0.0.1 -p 54329 -U portfolio portfolio }
} finally { Remove-Item Env:PGPASSWORD }
Write-Output 'Local PostgreSQL ready on 127.0.0.1:54329. Credentials are in ignored .env.local.'
