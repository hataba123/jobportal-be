import { BadRequestException } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SVG_MIME = 'image/svg+xml';

type ImageKind = 'png' | 'jpg' | 'svg';

function detectImageKind(mimetype: string, buffer: Buffer): ImageKind | null {
  if (mimetype === 'image/png' && buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (
    (mimetype === 'image/jpeg' || mimetype === 'image/jpg') &&
    buffer.length >= 3 &&
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
  ) return 'jpg';
  if (mimetype === SVG_MIME && /^\s*<svg(?:\s|>)/i.test(buffer.toString('utf8', 0, 512))) return 'svg';
  return null;
}

function assertSafeSvg(buffer: Buffer) {
  const content = buffer.toString('utf8');
  if (/<script|on[a-z]+\s*=|(?:xlink:)?href\s*=\s*["']https?:/i.test(content)) {
    throw new BadRequestException('SVG chứa nội dung không an toàn.');
  }
}

/** Lưu ảnh công khai với tên ngẫu nhiên, không tin tên file do client gửi. */
export async function savePublicImage(
  buffer: Buffer,
  mimetype: string,
  directory: 'logo' | 'images',
): Promise<string> {
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_SIZE) {
    throw new BadRequestException('Ảnh phải lớn hơn 0 và không vượt quá 5MB.');
  }
  const kind = detectImageKind(mimetype.toLowerCase(), buffer);
  if (!kind) throw new BadRequestException('Ảnh không đúng định dạng hoặc chữ ký file.');
  if (kind === 'svg') assertSafeSvg(buffer);

  const relativeDirectory = path.join('wwwroot', 'uploads', directory);
  const root = path.resolve(process.cwd(), relativeDirectory);
  await fs.mkdir(root, { recursive: true });
  const fileName = `${randomUUID()}.${kind}`;
  const target = path.resolve(root, fileName);
  if (!target.startsWith(`${root}${path.sep}`)) throw new BadRequestException('Đường dẫn ảnh không hợp lệ.');
  await fs.writeFile(target, buffer, { flag: 'wx' });
  return `/uploads/${directory}/${fileName}`;
}
