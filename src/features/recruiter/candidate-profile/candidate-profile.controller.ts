// Controller quản lý Candidate Profile cho recruiter/candidate
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RecruiterCandidateService } from './candidate-profile.service';
import {
  CandidateProfileUpdateDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/candidate-profile')
export class RecruiterCandidateProfileController {
  constructor(private readonly candidateService: RecruiterCandidateService) {}

  // Lấy profile ứng viên (self)
  @Get('me')
  @Roles('Candidate')
  async getProfile(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const result = await this.candidateService.getByUserId(userId);
    if (!result) throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    return result;
  }

  // Cập nhật profile ứng viên (self)
  @Put('me')
  @Roles('Candidate')
  async updateProfile(
    @Req() req: Request,
    @Body() dto: CandidateProfileUpdateDto,
  ) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const success = await this.candidateService.update(userId, dto);
    if (!success) throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    return { message: 'Cập nhật hồ sơ thành công' };
  }

  // Lấy chi tiết ứng viên theo recruiter
  @Get('recruiter/:id')
  @Roles('Recruiter')
  async getCandidateById(@Req() req: Request, @Param('id') id: string) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    const result = await this.candidateService.getCandidateById(
      recruiterId,
      id,
    );
    if (!result) throw new NotFoundException('Không tìm thấy ứng viên');
    return result;
  }

  // Lấy danh sách đơn ứng tuyển của ứng viên
  @Get('recruiter/:id/applications')
  @Roles('Recruiter')
  async getCandidateApplications(@Req() req: Request, @Param('id') id: string) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    return await this.candidateService.getCandidateApplications(
      recruiterId,
      id,
    );
  }

  // Tìm kiếm ứng viên
  @Get('recruiter/search')
  @Roles('Recruiter')
  async searchCandidates(
    @Req() req: Request,
    @Query() query: CandidateSearchRequest,
  ) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    return await this.candidateService.searchCandidates(recruiterId, query);
  }

  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter
  @Get('recruiter/applied')
  @Roles('Recruiter')
  async getCandidatesAppliedToMyJobs(@Req() req: Request) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    return await this.candidateService.getCandidatesForRecruiter(recruiterId);
  }

  // Upload CV cho ứng viên (self)
  @Post('me/upload-cv')
  @Roles('Candidate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(@Req() req: Request, @UploadedFile() file: any) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const url = await this.candidateService.uploadCv(userId, file);
    if (!url) throw new NotFoundException('Không tìm thấy đơn ứng tuyển.');
    return { url };
  }

  // Xóa CV ứng viên (self)
  @Delete('me/delete-cv')
  @Roles('Candidate')
  async deleteCv(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const success = await this.candidateService.deleteCv(userId);
    if (!success)
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển để xóa CV.');
    return { message: 'Đã xóa CV thành công' };
  }
}
