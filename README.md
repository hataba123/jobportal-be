# JobPortal Backend (NestJS)

API backend Node.js của hệ thống JobPortal. Repository này cung cấp các API cho ứng viên, nhà tuyển dụng và quản trị viên; frontend Next.js gọi API qua biến môi trường `BACKEND_API_URL`.

| Thông tin | Giá trị |
| --- | --- |
| Framework | NestJS 11 + Fastify |
| Ngôn ngữ | TypeScript |
| ORM | Prisma 6 |
| Cơ sở dữ liệu | PostgreSQL |
| Xác thực | JWT, phân quyền theo vai trò |
| Tài liệu API | Swagger/OpenAPI |
| Cổng mặc định | `5000` |

## Chức năng

- Đăng ký, đăng nhập, OAuth, đổi mật khẩu và đặt lại mật khẩu.
- Phân quyền cho `Admin`, `Recruiter` và `Candidate`.
- Quản lý tin tuyển dụng, vòng đời tin và đơn ứng tuyển.
- Quản lý công ty, danh mục nghề nghiệp, hồ sơ ứng viên và CV.
- Dashboard cho quản trị viên và nhà tuyển dụng.
- Tìm kiếm ứng viên, matching việc làm - ứng viên và quản lý việc làm đã lưu.
- Blog, đánh giá công ty và thông báo.
- Gói dịch vụ, credit và thanh toán VNPay sandbox.
- Health check, readiness check, giới hạn tốc độ và correlation ID cho request.

## Kiến trúc thư mục

```text
src/
├── features/
│   ├── admin/          # Người dùng, công ty, tin tuyển dụng, dashboard...
│   ├── auth/           # Xác thực và cấp JWT
│   ├── jobs/           # Tin tuyển dụng và đơn ứng tuyển
│   ├── matching/       # Matching việc làm - ứng viên
│   ├── payments/       # Gói dịch vụ, credit, VNPay
│   ├── recruiter/      # Dashboard, công ty, hồ sơ ứng viên
│   └── user/           # Blog, danh mục, công ty, review, thông báo...
├── common/             # Guard, pipe, filter, interceptor, DTO, security...
├── prisma/             # PrismaService và PrismaModule
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
├── migrations/
└── seed.js
```

## Yêu cầu môi trường

- Node.js 20 trở lên.
- npm 10 trở lên.
- PostgreSQL 13 trở lên hoặc Docker Desktop.
- Git.

## Cài đặt và chạy local

### 1. Lấy mã nguồn

```bash
git clone https://github.com/hataba123/jobportal-be.git
cd jobportal-be
npm ci
```

### 2. Cấu hình biến môi trường

Tạo `.env` từ `.env.example`:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Các biến bắt buộc:

| Biến | Mô tả |
| --- | --- |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL, ví dụ `postgresql://user:password@localhost:5432/jobportal?schema=public` |
| `JWT_SECRET` | Khóa ký JWT, nên là chuỗi ngẫu nhiên dài tối thiểu 32 ký tự |
| `OAUTH_EXCHANGE_SECRET` | Secret dùng khi frontend chuyển tiếp đăng nhập OAuth |
| `PORT` | Cổng HTTP, mặc định `5000` |

Thanh toán VNPay dùng thêm:

| Biến | Mô tả |
| --- | --- |
| `VNPAY_TMN_CODE` | Mã merchant VNPay sandbox |
| `VNPAY_HASH_SECRET` | Khóa ký VNPay sandbox |
| `VNPAY_PAYMENT_URL` | URL cổng thanh toán, mặc định là VNPay sandbox |
| `VNPAY_RETURN_URL` | URL frontend nhận kết quả trả về |

Biến tùy chọn:

| Biến | Mô tả |
| --- | --- |
| `FRONTEND_URL` | URL frontend dùng trong liên kết email, mặc định `http://localhost:3000` |
| `EMAIL_WEBHOOK_URL` | Webhook nội bộ để gửi email |
| `EMAIL_WEBHOOK_SECRET` | Bearer secret cho email webhook |

### 3. Khởi tạo Prisma và database

```bash
npx prisma generate
npx prisma migrate dev
```

Seed dữ liệu mẫu nếu cần:

```bash
npx prisma db seed
```

### 4. Khởi động API

```bash
npm run start:dev
```

Sau khi khởi động:

- API: <http://localhost:5000>
- Swagger UI: <http://localhost:5000/swagger>
- Liveness: <http://localhost:5000/health>
- Readiness: <http://localhost:5000/ready>

## Chạy bằng Docker Compose

Tạo `.env` và điền các giá trị bắt buộc, tối thiểu là `POSTGRES_PASSWORD`, `JWT_SECRET`, `OAUTH_EXCHANGE_SECRET`, `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`. Sau đó chạy:

```bash
docker compose up --build
```

Compose khởi động PostgreSQL ở cổng `5432`, API ở cổng `5000` và tự chạy `prisma migrate deploy` trước khi chạy server.

## Nhóm API chính

Tất cả endpoint nghiệp vụ dùng tiền tố `/api`:

| Nhóm | Một số endpoint tiêu biểu |
| --- | --- |
| Xác thực | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Việc làm | `GET /api/jobpost`, `GET /api/jobpost/:id`, `POST /api/jobpost` |
| Ứng tuyển | `POST /api/jobapplication`, `GET /api/jobapplication/my-jobs` |
| Công ty và danh mục | `GET /api/companies`, `GET /api/categories` |
| Hồ sơ và CV | `/api/candidate-profile/*` |
| Nhà tuyển dụng | `/api/recruiter/company`, `/api/recruiter/dashboard/*` |
| Quản trị | `/api/admin/users`, `/api/admin/companies`, `/api/admin/jobposts` |
| Nội dung | `/api/blogs`, `/api/reviews`, `/api/notifications` |
| Matching | `/api/matches/*` |
| Thanh toán | `/api/plans`, `/api/payment-orders`, `/api/credits/*` |

Endpoint yêu cầu đăng nhập nhận JWT qua header:

```http
Authorization: Bearer <access-token>
```

## Bảo mật và lưu ý vận hành

- Không commit `.env`, secret JWT, secret OAuth, thông tin VNPay hoặc thông tin database.
- CORS hiện cho phép các frontend local ở cổng `3000`, `3001` và `3002`; cần cập nhật `src/main.ts` khi triển khai domain mới.
- CV được lưu trong storage riêng và endpoint static `/uploads/cv` bị chặn trực tiếp. Chỉ endpoint có kiểm tra quyền mới được phục vụ CV.
- Upload bị giới hạn kích thước theo `APP_CONSTANTS.MAX_FILE_SIZE`.
- API có rate limit cho request chung, xác thực và thanh toán.
- Khi triển khai production, dùng secret ngẫu nhiên, bật HTTPS và cấu hình domain frontend cụ thể.

## Lệnh phát triển

| Lệnh | Mục đích |
| --- | --- |
| `npm run start:dev` | Chạy development mode với watch |
| `npm run build` | Build TypeScript/NestJS |
| `npm run start:prod` | Chạy bản build trong `dist` |
| `npm run lint` | Kiểm tra ESLint |
| `npm run test` | Chạy unit test |
| `npm run test:e2e` | Chạy end-to-end test |
| `npm run test:cov` | Chạy test và tạo coverage |
| `npm run format` | Format mã nguồn bằng Prettier |

## Kiểm thử

```bash
npm run build
npm run test
npm run test:e2e
```

E2E test cần API và database được cấu hình phù hợp. Khi chỉ kiểm tra logic/service, chạy `npm run test` là đủ.

## Liên kết các thành phần

- Frontend: <https://github.com/hataba123/jobportal-fe>
- API ASP.NET Core: <https://github.com/hataba123/JobPortalApi>

## Đóng góp

1. Tạo branch theo nhóm thay đổi, ví dụ `feature/job-search` hoặc `fix/auth-validation`.
2. Giữ thay đổi tập trung, không commit file `.env` hoặc dữ liệu upload.
3. Chạy build và test liên quan trước khi mở Pull Request.
4. Viết commit message ngắn gọn theo quy ước `feat:`, `fix:`, `docs:`, `test:` hoặc `chore:`.
