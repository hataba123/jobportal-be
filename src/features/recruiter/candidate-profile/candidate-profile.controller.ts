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
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { RecruiterCandidateService } from './candidate-profile.service';
import {
  CandidateProfileUpdateDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';
import { UserRoleEnum } from '../../../features/auth/auth.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PageQueryDto } from '../../../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/candidate-profile')
export class RecruiterCandidateProfileController {
  constructor(private readonly candidateService: RecruiterCandidateService) {}

  // Lấy profile ứng viên (self)
  @Get('me')
  @Roles('2')
  async getProfile(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const result = await this.candidateService.getByUserId(userId);
    if (!result) throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    return result;
  }

  @Get('me/cv')
  @Roles('2')
  async downloadMyCv(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const file = await this.candidateService.getCvFile(userId, userId);
    if (!file) throw new NotFoundException('Không tìm thấy CV.');
    return new StreamableFile(file.buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="resume.pdf"',
    });
  }

  // Cập nhật profile ứng viên (self)
  @Put('me')
  @Roles('2')
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

  // Tìm kiếm ứng viên (phải đặt trước route có :id)
  @Get('recruiter/search')
  @Roles('1')
  async searchCandidates(
    @Req() req: Request,
    @Query() query: CandidateSearchRequest,
  ) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    // HTTP query luôn được bind thành DTO và sử dụng paging ở database.
    return await this.candidateService.searchCandidatesPaged(recruiterId, query);
  }

  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter (phải đặt trước route có :id)
  @Get('recruiter/applied')
  @Roles('1')
  async getCandidatesAppliedToMyJobs(
    @Req() req: Request,
    @Query() query: CandidateSearchRequest,
  ) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    return await this.candidateService.getCandidatesForRecruiterPaged(
      recruiterId,
      query,
    );
  }

  // Lấy chi tiết ứng viên theo recruiter (route có :id phải đặt cuối)
  @Get('recruiter/:id')
  @Roles('1')
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

  // Lấy danh sách đơn ứng tuyển của ứng viên (route có :id phải đặt cuối)
  @Get('recruiter/:id/applications')
  @Roles('1')
  async getCandidateApplications(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() query?: PageQueryDto,
  ) {
    const recruiterId = req.user?.['userId'];
    if (!recruiterId)
      throw new UnauthorizedException('Không xác thực được user');
    if (query) {
      return this.candidateService.getCandidateApplicationsPaged(
        recruiterId,
        id,
        query.page,
        query.pageSize,
      );
    }
    return await this.candidateService.getCandidateApplications(recruiterId, id);
  }

  @Get('recruiter/:id/cv')
  @Roles('0', '1')
  async downloadCandidateCv(@Req() req: Request, @Param('id') id: string) {
    const actorId = req.user?.['userId'];
    if (!actorId) throw new UnauthorizedException('Không xác thực được user');
    const file = await this.candidateService.getCvFile(
      actorId,
      id,
      String(req.user?.['role']) === '0',
    );
    if (!file) throw new NotFoundException('Không tìm thấy CV.');
    return new StreamableFile(file.buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="resume.pdf"',
    });
  }

  // Upload CV cho ứng viên (self) - Fastify multipart
  // Viết lại CHUẨN Fastify: lấy file từ req.parts(), log chi tiết lỗi để debug
  @Post('me/upload-cv')
  @Roles('2')
  async uploadCv(@Req() req: any) {
    // Lấy userId từ request (Fastify)
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    // Khai báo đúng kiểu cho fileData
    let fileData: { originalname: string; buffer: Buffer } | null = null;
    try {
      // Lấy file từ multipart (Fastify)
      const parts = req.parts ? req.parts() : req.raw.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          // Log thông tin file nhận được
          console.log(
            '[UPLOAD-CV] Nhận file:',
            part.filename,
            part.fieldname,
            part.mimetype,
          );
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          if (part.file.truncated) {
            throw new BadRequestException('File CV vượt quá dung lượng cho phép.');
          }
          fileData = {
            originalname: part.filename,
            buffer: Buffer.concat(chunks),
          };
          break;
        }
      }
      if (!fileData) {
        console.error('[UPLOAD-CV] Không nhận được file từ multipart');
        throw new NotFoundException('Không nhận được file CV');
      }
      // Gọi service upload
      const url = await this.candidateService.uploadCv(userId, fileData);
      if (!url) {
        console.error('[UPLOAD-CV] Không tìm thấy đơn ứng tuyển khi upload');
        throw new NotFoundException('Không tìm thấy đơn ứng tuyển.');
      }
      return { url };
    } catch (err) {
      // Log lỗi chi tiết để debug
      console.error('[UPLOAD-CV] Lỗi upload CV:', err);
      throw err?.status && err?.message
        ? err
        : new Error('Lỗi upload CV: ' + (err?.message || err));
    }
  }

  // Xóa CV ứng viên (self)
  @Delete('me/delete-cv')
  @Roles('2')
  async deleteCv(@Req() req: Request) {
    const userId = req.user?.['userId'];
    if (!userId) throw new UnauthorizedException('Không xác thực được user');
    const success = await this.candidateService.deleteCv(userId);
    if (!success)
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển để xóa CV.');
    return { message: 'Đã xóa CV thành công' };
  }
}
