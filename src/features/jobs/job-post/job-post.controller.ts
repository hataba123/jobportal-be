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
} from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';

// Controller quản lý job post
@Controller('jobs/job-post')
export class JobPostController {
  // Inject service qua constructor
  constructor(private readonly jobPostService: JobPostService) {}

  // Tạo job post mới
  @Post()
  async create(@Req() req, @Body() dto: CreateJobPostDto) {
    // Giả sử lấy employerId từ req.user (cần guard thực tế)
    const employerId = req.user?.id;
    return this.jobPostService.create(employerId, dto);
  }

  // Cập nhật job post
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateJobPostDto) {
    return this.jobPostService.update(id, dto);
  }

  // Xóa job post
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.jobPostService.delete(id);
  }

  // Lấy chi tiết job post
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.jobPostService.getById(id);
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
}
