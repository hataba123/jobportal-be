// Controller quản lý job post cho admin
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  Query,
} from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto } from '../../../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/jobposts')
export class JobPostController {
  constructor(private readonly jobPostService: JobPostService) {}

  // Lấy tất cả job post
  @Get()
  async getAll(@Query() query?: PageQueryDto) {
    if (query) return this.jobPostService.getAllJobPostsPaged(query);
    return await this.jobPostService.getAllJobPosts();
  }

  // Lấy chi tiết job post
  @Get(':id')
  async getById(@Param('id') id: string) {
    const j = await this.jobPostService.getJobPostById(id);
    if (!j) throw new NotFoundException('Job post not found');
    return j;
  }

  // Tạo mới job post
  @Post()
  async create(@Body() dto: CreateJobPostDto) {
    return await this.jobPostService.createJobPost(dto);
  }

  // Cập nhật job post
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateJobPostDto, @Headers('if-match') ifMatch?: string) {
    const updated = await this.jobPostService.updateJobPost(id, dto, decodeVersion(ifMatch));
    if (!updated) throw new NotFoundException('Job post not found');
    return;
  }

  // Xóa job post
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Headers('if-match') ifMatch?: string) {
    const deleted = await this.jobPostService.deleteJobPost(id, decodeVersion(ifMatch));
    if (!deleted) throw new NotFoundException('Job post not found');
    return;
  }
}
