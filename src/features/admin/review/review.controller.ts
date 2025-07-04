// Controller quản lý review cho admin
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './review.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Lấy tất cả review
  @Get()
  async getAll() {
    return await this.reviewService.getAllReviews();
  }

  // Lấy review theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const r = await this.reviewService.getReviewById(id);
    if (!r) throw new NotFoundException('Review not found');
    return r;
  }

  // Cập nhật review
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    const updated = await this.reviewService.updateReview(id, dto);
    if (!updated) throw new NotFoundException('Review not found');
    return;
  }

  // Xóa review
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    const deleted = await this.reviewService.deleteReview(id);
    if (!deleted) throw new NotFoundException('Review not found');
    return;
  }
}
