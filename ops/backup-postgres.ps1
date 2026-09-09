[CmdletBinding()]
param(
    [string]$OutputDirectory = $(if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path (Get-Location) "backups" })
)

$ErrorActionPreference = "Stop"

$requiredVariables = @("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD")
$missingVariables = foreach ($variable in $requiredVariables) {
    $value = (Get-Item -LiteralPath "Env:$variable" -ErrorAction SilentlyContinue).Value
    if ([string]::IsNullOrWhiteSpace($value)) { $variable }
}
if ($missingVariables.Count -gt 0) {
    throw "Thiếu biến môi trường kết nối PostgreSQL: $($missingVariables -join ', ')."
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($null -eq $pgDump) {
    throw "Không tìm thấy pg_dump trong PATH. Hãy cài PostgreSQL client trước khi chạy backup."
}

$resolvedDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedDirectory -Force | Out-Null

$timestamp = [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ")
$targetFile = Join-Path $resolvedDirectory "jobportal-postgres-$timestamp.dump"

& $pgDump.Source `
    --host=$env:PGHOST `
    --port=$env:PGPORT `
    --username=$env:PGUSER `
    --dbname=$env:PGDATABASE `
    --format=custom `
    --file=$targetFile `
    --no-owner `
    --no-privileges

if ($LASTEXITCODE -ne 0) {
    throw "pg_dump thất bại với mã lỗi $LASTEXITCODE."
}

Get-Item -LiteralPath $targetFile | Select-Object FullName, Length, LastWriteTimeUtc
