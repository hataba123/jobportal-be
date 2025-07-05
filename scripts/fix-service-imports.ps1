# Script để fix import alias trong các service files
Write-Host "Fixing PrismaService imports in service files..."

# Lấy tất cả các file .ts trong src/ (trừ module files)
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Where-Object { 
    $_.Name -notlike "*.module.ts" -and 
    $_.Name -notlike "main.ts" -and
    $_.Name -notlike "app.*.ts"
}

foreach ($file in $files) {
    Write-Host "Checking $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Thay thế import alias bằng relative path
    # Từ src/features/*/*.service.ts -> ../../prisma/prisma.service
    # Từ src/features/*/*/*.service.ts -> ../../../prisma/prisma.service
    
    if ($content -match "import \{ PrismaService \} from 'src/prisma/prisma\.service';") {
        $relativePath = $file.FullName -replace ".*\\src\\", ""
        $depth = ($relativePath -split "\\").Length - 1
        
        $relativeImport = "../" * $depth + "prisma/prisma.service"
        
        $content = $content -replace "import \{ PrismaService \} from 'src/prisma/prisma\.service';", "import { PrismaService } from '$relativeImport';"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Fixed $($file.FullName) with relative path: $relativeImport"
        }
    }
}

Write-Host "Done fixing service imports!"
