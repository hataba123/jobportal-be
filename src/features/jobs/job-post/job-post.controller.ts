import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../../features/auth/auth.dto';

// Controller quản lý job post
@ApiTags('JobPost')
@Controller('api/jobpost')
export class JobPostController {
  // Inject service quản lý job post
  constructor(private readonly jobPostService: JobPostService) {}

  // Tạo job post mới - chỉ employer đã đăng nhập mới được phép
  @UseGuards(JwtAuthGuard, RolesGuard)
  // Chỉ recruiter (role = 1) được phép thao tác
  @Roles(UserRoleEnum.Recruiter.toString())
  @Post()
  // Tạo job post mới - chỉ recruiter đã đăng nhập mới được phép
  async create(@Req() req, @Body() dto: CreateJobPostDto) {
    // Lấy employerId từ req.user.userId (đồng bộ với JWT payload)
    const employerId = req.user?.userId;
    console.log('req.user:', req.user); // Log user để debug JWT payload
    return this.jobPostService.create(employerId, dto);
  }

  // Cập nhật job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Recruiter.toString())
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateJobPostDto) {
    return this.jobPostService.update(id, dto);
  }

  // Xóa job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Recruiter.toString())
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.jobPostService.delete(id);
  }

  // Lấy chi tiết job post theo id
  // Trả về 404 nếu không tìm thấy, log id để debug
  @Get(':id')
  async getById(@Param('id') id: string) {
    console.log('GET job post by id:', id); // Log id để debug
    const jobPost = await this.jobPostService.getById(id);
    if (!jobPost)
      throw new NotFoundException('Không tìm thấy job post với id: ' + id);
    return jobPost;
  }

  // Lấy tất cả job post
  @Get()
  async getAll() {
    return this.jobPostService.getAll();
  }

  // Lấy job post theo employer
  @Get('/employer/:employerId')
  async getByEmployer(@Param('employerId') employerId: string) {
    return this.jobPostService.getByEmployer(employerId);
  }

  // Lấy job post theo công ty
  @Get('/company/:companyId')
  async getByCompany(@Param('companyId') companyId: string) {
    return this.jobPostService.getByCompany(companyId);
  }

  // Lấy job post theo ngành nghề
  @Get('/category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string) {
    return this.jobPostService.getByCategory(categoryId);
  }

  // Lấy job post của recruiter hiện tại (my-posts)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Recruiter.toString())
  @Get('/my-posts')
  // Lấy job post của recruiter hiện tại (my-posts)
  async getMyPosts(@Req() req) {
    console.log('req.user:', req.user); // Log user để debug JWT payload
    const employerId = req.user?.userId;
    return this.jobPostService.getByEmployer(employerId);
  }
}
