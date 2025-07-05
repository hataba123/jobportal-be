# Job Portal Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Mô tả dự án

**Job Portal Backend** là một hệ thống API tuyển dụng việc làm được xây dựng bằng **NestJS**, **TypeScript**, **Prisma ORM** và **Fastify**. Hệ thống hỗ trợ 3 loại người dùng chính: Admin, Recruiter (Nhà tuyển dụng) và Candidate (Ứng viên).

## Kiến trúc và công nghệ

### Stack công nghệ

- **Framework**: NestJS với Fastify adapter
- **Database**: PostgreSQL/MySQL với Prisma ORM
- **Authentication**: JWT với role-based access control
- **Upload**: Fastify multipart cho CV và hình ảnh
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer

### Kiến trúc hệ thống

```
src/
├── features/           # Các tính năng chính theo domain
│   ├── admin/         # Quản lý admin
│   │   ├── company/   # Quản lý công ty
│   │   ├── job-post/  # Quản lý bài đăng việc làm
│   │   ├── user/      # Quản lý người dùng
│   │   ├── notification/ # Quản lý thông báo
│   │   └── dashboard/ # Dashboard admin
│   ├── recruiter/     # Tính năng cho nhà tuyển dụng
│   │   ├── company/   # Quản lý công ty của recruiter
│   │   ├── candidate-profile/ # Xem hồ sơ ứng viên
│   │   └── dashboard/ # Dashboard recruiter
│   ├── user/          # Tính năng cho người dùng
│   │   ├── blogs/     # Blog và tin tức
│   │   ├── company/   # Xem thông tin công ty
│   │   ├── category/  # Danh mục ngành nghề
│   │   ├── notification/ # Thông báo cá nhân
│   │   ├── review/    # Đánh giá công ty
│   │   └── saved-job/ # Công việc đã lưu
│   ├── jobs/          # Quản lý việc làm
│   │   ├── job-post/  # Bài đăng việc làm
│   │   └── job-application/ # Ứng tuyển việc làm
│   └── auth/          # Xác thực và phân quyền
├── common/            # Các thành phần dùng chung
│   ├── guards/        # Bảo mật và phân quyền
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── interceptors/  # Request/Response interceptors
│   ├── pipes/         # Validation pipes
│   ├── constants/     # Hằng số ứng dụng
│   └── utils/         # Utility functions
└── prisma/           # Database schema và migrations
```

## Design Patterns được sử dụng

Dự án áp dụng nhiều Design Patterns để đảm bảo code sạch, dễ bảo trì và có thể mở rộng:

### 🏗️ Creational Patterns

#### 1. **Dependency Injection (DI)**

- **Mô tả**: NestJS sử dụng DI container để quản lý dependencies
- **Ví dụ**:

  ```typescript
  @Injectable()
  export class JobPostService {
    constructor(private readonly prisma: PrismaService) {}
  }
  ```

- **Lợi ích**: Loose coupling, dễ test, dễ mở rộng

#### 2. **Factory Pattern**

- **Mô tả**: Sử dụng trong NestFactory để tạo application instance
- **Ví dụ**: `NestFactory.create<NestFastifyApplication>(AppModule)`
- **Lợi ích**: Tạo object phức tạp một cách linh hoạt

#### 3. **Builder Pattern**

- **Mô tả**: Swagger DocumentBuilder để cấu hình API documentation
- **Ví dụ**:

  ```typescript
  const config = new DocumentBuilder()
    .setTitle('Job Portal API')
    .setDescription('API documentation cho hệ thống tuyển dụng việc làm')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  ```

### 🏛️ Structural Patterns

#### 4. **Module Pattern**

- **Mô tả**: Tổ chức code theo modules để phân chia trách nhiệm
- **Ví dụ**: `JobApplicationModule`, `AuthModule`, `CompanyModule`
- **Lợi ích**: Separation of concerns, dễ maintain

#### 5. **Adapter Pattern**

- **Mô tả**: FastifyAdapter để tích hợp Fastify với NestJS
- **Ví dụ**: `new FastifyAdapter()`
- **Lợi ích**: Tương thích giữa các interface khác nhau

#### 6. **Facade Pattern**

- **Mô tả**: Service layer che giấu complexity của business logic
- **Ví dụ**: `AuthService` che giấu logic JWT, hashing, validation
- **Lợi ích**: Đơn giản hóa interface cho client

#### 7. **Decorator Pattern**

- **Mô tả**: NestJS decorators để thêm functionality
- **Ví dụ**: `@Controller`, `@Injectable`, `@UseGuards`, `@Roles`
- **Lợi ích**: Thêm behavior mà không thay đổi class structure

### 🎭 Behavioral Patterns

#### 8. **Strategy Pattern**

- **Mô tả**: JWT Strategy cho authentication
- **Ví dụ**: `JwtStrategy extends PassportStrategy`
- **Lợi ích**: Thay đổi algorithm authentication dễ dàng

#### 9. **Observer Pattern**

- **Mô tả**: NestJS Interceptors để observe request/response
- **Ví dụ**: `LoggingInterceptor`, `ResponseInterceptor`
- **Lợi ích**: Xử lý cross-cutting concerns

#### 10. **Chain of Responsibility**

- **Mô tả**: Middleware chain trong NestJS
- **Ví dụ**: Guards → Interceptors → Pipes → Controllers
- **Lợi ích**: Xử lý request qua nhiều layers

#### 11. **Template Method Pattern**

- **Mô tả**: Base service interfaces với template methods
- **Ví dụ**: `INotificationService` interface với các method chuẩn
- **Lợi ích**: Định nghĩa skeleton của algorithm

#### 12. **Command Pattern**

- **Mô tả**: DTOs như commands để thực hiện operations
- **Ví dụ**: `CreateJobPostDto`, `UpdateUserDto`, `JobApplicationRequest`
- **Lợi ích**: Encapsulate requests as objects

### 🔧 NestJS-Specific Patterns

#### 13. **Repository Pattern**

- **Mô tả**: Prisma service như repository để truy cập data
- **Ví dụ**: `PrismaService` được inject vào các services
- **Lợi ích**: Abstraction layer cho data access

#### 14. **DTO (Data Transfer Object) Pattern**

- **Mô tả**: Định nghĩa structure cho data transfer
- **Ví dụ**: `UserDto`, `JobPostDto`, `CandidateProfileDto`
- **Lợi ích**: Type safety, validation, documentation

#### 15. **Guard Pattern**

- **Mô tả**: Guards để kiểm soát access control
- **Ví dụ**: `JwtAuthGuard`, `RolesGuard`
- **Lợi ích**: Centralized authorization logic

#### 16. **Pipe Pattern**

- **Mô tả**: Transform và validate data
- **Ví dụ**: `ValidationPipe`, `CustomValidationPipe`
- **Lợi ích**: Data transformation và validation

#### 17. **Filter Pattern**

- **Mô tả**: Exception handling
- **Ví dụ**: `HttpExceptionFilter`
- **Lợi ích**: Centralized error handling

### 🏗️ Architectural Patterns

#### 18. **Domain-Driven Design (DDD)**

- **Mô tả**: Tổ chức code theo business domains
- **Ví dụ**: `features/admin`, `features/recruiter`, `features/user`
- **Lợi ích**: Business logic rõ ràng, dễ hiểu

#### 19. **Layered Architecture**

- **Mô tả**: Phân chia thành các layers: Controller → Service → Repository
- **Ví dụ**:

  ```
  Controller (HTTP) → Service (Business Logic) → Prisma (Data Access)
  ```

- **Lợi ích**: Separation of concerns, testability

#### 20. **CQRS (Command Query Responsibility Segregation)**

- **Mô tả**: Phân tách read và write operations
- **Ví dụ**: Các method `get*` và `create*/update*/delete*` trong services
- **Lợi ích**: Optimized cho read/write performance

### 🔐 Security Patterns

#### 21. **Role-Based Access Control (RBAC)**

- **Mô tả**: Phân quyền dựa trên roles
- **Ví dụ**: `UserRole` enum với Admin/Recruiter/Candidate
- **Lợi ích**: Fine-grained access control

#### 22. **JWT Token Pattern**

- **Mô tả**: Stateless authentication với JWT
- **Ví dụ**: `JwtStrategy`, `AuthService.generateToken()`
- **Lợi ích**: Scalable authentication

### 🛠️ Utility Patterns

#### 23. **Utility/Helper Pattern**

- **Mô tả**: Static utility classes
- **Ví dụ**: `FileUtil` cho file operations
- **Lợi ích**: Reusable functionality

#### 24. **Constants Pattern**

- **Mô tả**: Centralized constants management
- **Ví dụ**: `APP_CONSTANTS`, `ERROR_MESSAGES`
- **Lợi ích**: Avoid magic strings, easy maintenance

#### 25. **Enum Pattern**

- **Mô tả**: Type-safe constants
- **Ví dụ**: `UserRoleEnum`, `JobType`, `ApplyStatus`
- **Lợi ích**: Type safety, IntelliSense support

### 📊 Data Patterns

#### 26. **Active Record Pattern (via Prisma)**

- **Mô tả**: Database operations thông qua Prisma models
- **Ví dụ**: `prisma.user.findMany()`, `prisma.jobPost.create()`
- **Lợi ích**: ORM abstraction, type safety

#### 27. **Specification Pattern**

- **Mô tả**: Complex queries với Prisma where conditions
- **Ví dụ**: Search filters trong `BlogService`, `CandidateService`
- **Lợi ích**: Flexible query building

## Lợi ích của việc sử dụng Design Patterns

### ✅ **Code Quality**

- **Maintainability**: Code dễ bảo trì và mở rộng
- **Readability**: Structure rõ ràng, dễ hiểu
- **Consistency**: Cùng pattern xuyên suốt dự án

### ✅ **Development Efficiency**

- **Reusability**: Tái sử dụng code hiệu quả
- **Testability**: Dễ viết unit tests
- **Collaboration**: Team dễ hiểu và làm việc cùng nhau

### ✅ **System Architecture**

- **Scalability**: Dễ mở rộng khi business phát triển
- **Flexibility**: Thay đổi implementation mà không ảnh hưởng client
- **Separation of Concerns**: Mỗi component có trách nhiệm rõ ràng

### ✅ **Best Practices**

- **SOLID Principles**: Tuân theo các nguyên tắc SOLID
- **Clean Code**: Code sạch, self-documenting
- **Industry Standards**: Theo chuẩn industry-proven patterns

## Tính năng chính

### 🔐 Xác thực và phân quyền

- JWT authentication với refresh token
- Role-based access control (Admin/Recruiter/Candidate)
- OAuth integration (Google, Facebook)
- Password hashing với bcrypt

### 👨‍💼 Quản trị viên (Admin)

- Quản lý người dùng toàn hệ thống
- Quản lý công ty và bài đăng việc làm
- Xem thống kê và dashboard tổng quan
- Quản lý thông báo hệ thống
- Duyệt và kiểm duyệt nội dung

### 🏢 Nhà tuyển dụng (Recruiter)

- Quản lý thông tin công ty của mình
- Đăng và quản lý bài tuyển dụng
- Xem danh sách ứng viên ứng tuyển
- Tìm kiếm và lọc ứng viên
- Cập nhật trạng thái đơn ứng tuyển

### 👤 Ứng viên (Candidate)

- Tạo và quản lý hồ sơ cá nhân
- Tìm kiếm và lọc việc làm
- Ứng tuyển và upload CV
- Lưu việc làm yêu thích
- Theo dõi trạng thái đơn ứng tuyển
- Đánh giá công ty

### 📝 Blog và nội dung

- Hệ thống blog với phân loại
- Tính năng tìm kiếm và lọc
- Quản lý tags và categories
- Thống kê lượt xem và tương tác

## Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13.0

### 1. Clone repository

```bash
git clone <repository-url>
cd jobportal-be
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jobportal"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Upload
UPLOAD_PATH="./wwwroot/uploads"
MAX_FILE_SIZE=5242880  # 5MB

# Server
PORT=5000
NODE_ENV=development
```

### 4. Setup database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Chạy ứng dụng

#### Development mode

```bash
npm run start:dev
```

#### Production mode

```bash
npm run build
npm run start:prod
```

### 6. Truy cập ứng dụng

- **API Server**: http://localhost:5000
- **Swagger Documentation**: http://localhost:5000/swagger
- **Static Files**: http://localhost:5000/uploads/

## API Documentation

### Swagger UI

Truy cập http://localhost:5000/swagger để xem tài liệu API chi tiết với giao diện tương tác.

### Các endpoint chính

#### Authentication

```
POST /api/auth/register     # Đăng ký tài khoản
POST /api/auth/login        # Đăng nhập
POST /api/auth/oauth-login  # Đăng nhập OAuth
GET  /api/auth/me          # Thông tin user hiện tại
```

#### Job Management

```
GET    /api/jobpost         # Danh sách việc làm
GET    /api/jobpost/:id     # Chi tiết việc làm
POST   /api/jobpost         # Tạo bài đăng (Recruiter)
PUT    /api/jobpost/:id     # Cập nhật bài đăng (Recruiter)
DELETE /api/jobpost/:id     # Xóa bài đăng (Recruiter)
```

#### Job Application

```
POST /api/jobapplication              # Ứng tuyển việc làm
GET  /api/jobapplication/my-jobs      # Việc làm đã ứng tuyển
GET  /api/jobapplication/job/:id/candidates # Ứng viên của job (Recruiter)
```

#### Company Management

```
GET /api/companies          # Danh sách công ty
GET /api/companies/:id      # Chi tiết công ty
GET /api/recruiter/company  # Công ty của recruiter
PUT /api/recruiter/company  # Cập nhật công ty
```

## Testing

### Unit tests

```bash
npm run test
```

### E2E tests

```bash
npm run test:e2e
```

### Test coverage

```bash
npm run test:cov
```

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t jobportal-backend .

# Run container
docker run -p 5000:5000 --env-file .env jobportal-backend
```

### PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Build project
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

### Environment Variables

Các biến môi trường quan trọng:

- `DATABASE_URL`: Connection string database
- `JWT_SECRET`: Secret key cho JWT
- `NODE_ENV`: Môi trường (development/production)
- `PORT`: Port chạy server
- `UPLOAD_PATH`: Đường dẫn lưu file upload

## Best Practices

### Code Style

- Sử dụng **TypeScript** strict mode
- **ESLint** + **Prettier** cho code formatting
- **Husky** + **lint-staged** cho pre-commit hooks
- Comment tiếng Việt cho functions và classes

### Security

- JWT với short expiration time
- Password hashing với bcrypt
- Input validation với class-validator
- File upload validation
- CORS configuration
- Rate limiting

### Performance

- Database indexing với Prisma
- Caching với Redis (optional)
- Compression middleware
- Static file serving
- Database connection pooling

## Contribution

### Development Workflow

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Code Standards

- Tuân theo instruction-nestjs.instructions.md
- Sử dụng enum thay vì hardcode strings
- Async/await pattern
- Proper error handling
- Unit tests cho business logic

## License

Dự án này được phát hành dưới [MIT License](LICENSE).

## Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- Tạo [GitHub Issue](../../issues)
- Email: support@jobportal.com
- Documentation: [Wiki](../../wiki)

## Acknowledgments

- [NestJS](https://nestjs.com/) - Framework chính
- [Prisma](https://prisma.io/) - Database ORM
- [Fastify](https://fastify.io/) - Web framework
- [Swagger](https://swagger.io/) - API documentation
