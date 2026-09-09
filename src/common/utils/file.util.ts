// Utility functions xử lý file upload và validation
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { APP_CONSTANTS } from '../constants/app.constants';

export class FileUtil {
  // Validate file type theo extension
  static validateFileType(
    filename: string,
    allowedTypes: readonly string[],
  ): boolean {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return allowedTypes.includes(ext);
  }

  // Validate file size
  static validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }

  // Tạo tên file unique
  static generateUniqueFileName(): string {
    return `${randomUUID()}.pdf`;
  }

  // Đảm bảo thư mục tồn tại
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Xóa file nếu tồn tại
  static deleteFileIfExists(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Validate file cho CV upload
  static validateCvFile(filename: string, fileSize: number, buffer: Buffer): void {
    // Convert readonly array thành mutable array để sử dụng
    const allowedTypes = [...APP_CONSTANTS.ALLOWED_FILE_TYPES];

    if (!this.validateFileType(filename, allowedTypes)) {
      throw new BadRequestException(
        `File phải có định dạng: ${allowedTypes.join(', ')}`,
      );
    }

    if (!this.validateFileSize(fileSize, APP_CONSTANTS.MAX_FILE_SIZE)) {
      throw new BadRequestException(
        `File không được vượt quá ${APP_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new BadRequestException('Nội dung file không phải PDF hợp lệ.');
    }
  }

  static getPrivateCvDirectory(): string {
    return path.join(process.cwd(), APP_CONSTANTS.PRIVATE_CV_DIRECTORY);
  }

  static resolvePrivateCvPath(storageKey: string | null | undefined): string | null {
    if (!storageKey || !/^[0-9a-f-]{36}\.pdf$/i.test(storageKey)) return null;
    const root = path.resolve(this.getPrivateCvDirectory());
    const resolved = path.resolve(root, storageKey);
    return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
  }
}
