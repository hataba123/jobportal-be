# Vận hành

## Backup PostgreSQL

Đặt `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` trong secret store hoặc
phiên chạy bảo mật. Có thể đặt thêm `BACKUP_DIR`; mặc định file được ghi vào thư mục
`backups` hiện tại.

```powershell
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGDATABASE = "jobportal"
$env:PGUSER = "jobportal"
$env:PGPASSWORD = "<secret-không-commit>"
& .\ops\backup-postgres.ps1
```

Script dùng định dạng custom của `pg_dump`, không in mật khẩu và không xóa bản backup
cũ. Cần đặt lịch chạy và chính sách lưu giữ ở môi trường triển khai.
