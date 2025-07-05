# Script để fix tất cả import alias src/ thành relative path
Write-Host "Fixing all src/ alias imports to relative paths..."

# Lấy tất cả các file .ts
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    Write-Host "Checking $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Tính toán relative path từ file hiện tại về root src/
    $relativePath = $file.FullName -replace ".*\\src\\", ""
    $depth = ($relativePath -split "\\").Length - 1
    $relativePrefix = "../" * $depth
    
    # Thay thế các import src/ thành relative path
    $content = $content -replace "from 'src/common/", "from '${relativePrefix}common/"
    $content = $content -replace "from 'src/features/", "from '${relativePrefix}features/"
    $content = $content -replace "from 'src/prisma/", "from '${relativePrefix}prisma/"
    
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Fixed $($file.FullName)"
        } catch {
            Write-Host "Error fixing $($file.FullName): $_"
        }
    }
}

Write-Host "Done fixing all alias imports!"
