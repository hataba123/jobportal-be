# Script để fix tất cả module loại bỏ PrismaService import không cần thiết
# Vì PrismaModule đã là @Global(), không cần import PrismaService ở từng module

$modules = @(
    "src\features\admin\company\company.module.ts",
    "src\features\admin\dashboard\dashboard.module.ts", 
    "src\features\admin\job-post\job-post.module.ts",
    "src\features\admin\notification\notification.module.ts",
    "src\features\admin\review\review.module.ts",
    "src\features\recruiter\dashboard\dashboard.module.ts",
    "src\features\user\blogs\blogs.module.ts",
    "src\features\user\category\category.module.ts",
    "src\features\user\company\company.module.ts",
    "src\features\user\notification\notification.module.ts",
    "src\features\user\review\review.module.ts",
    "src\features\user\saved-job\saved-job.module.ts"
)

foreach ($module in $modules) {
    if (Test-Path $module) {
        Write-Host "Fixing $module"
        
        # Đọc nội dung file
        $content = Get-Content $module -Raw
        
        # Loại bỏ import PrismaService
        $content = $content -replace "import \{ PrismaService \} from 'src/prisma/prisma\.service';\r?\n", ""
        $content = $content -replace ", PrismaService", ""
        
        # Ghi lại file
        Set-Content $module -Value $content -NoNewline
        
        Write-Host "Fixed $module"
    }
}

Write-Host "Done fixing all modules!"
