import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { savePublicImage } from '../../common/utils/media.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0', '1')
@Controller('api/media')
export class MediaController {
  @Post('company-logo')
  async uploadCompanyLogo(@Req() request: any) {
    return this.saveFirstImage(request, 'logo');
  }

  @Post('blog-image')
  @Roles('0')
  async uploadBlogImage(@Req() request: any) {
    return this.saveFirstImage(request, 'images');
  }

  private async saveFirstImage(request: any, directory: 'logo' | 'images') {
    if (!request.parts) throw new BadRequestException('Request phải là multipart/form-data.');
    for await (const part of request.parts()) {
      if (part.type !== 'file') continue;
      const chunks: Buffer[] = [];
      for await (const chunk of part.file) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      if (part.file.truncated) throw new BadRequestException('Ảnh vượt quá dung lượng cho phép.');
      return { url: await savePublicImage(Buffer.concat(chunks), part.mimetype, directory) };
    }
    throw new BadRequestException('Không nhận được file ảnh.');
  }
}
