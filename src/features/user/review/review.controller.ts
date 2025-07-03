// Controller quản lý review cho user
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewRequest } from './review.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Lấy tất cả review
  @Get()
  async getAll() {
    return this.reviewService.getAllAsync();
  }

  // Lấy review theo companyId
  @Get('company/:companyId')
  async getByCompany(@Param('companyId') companyId: string) {
    return this.reviewService.getByCompanyAsync(companyId);
  }

  // Tạo mới review
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() request: CreateReviewRequest) {
    const userId = req.user.userId;
    await this.reviewService.createAsync(userId, request);
    return { message: 'Đánh giá đã được gửi.' };
  }
}
