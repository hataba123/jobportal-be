import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';

class PreconditionRequiredException extends HttpException {
  constructor(message = 'If-Match là bắt buộc.') {
    super({ statusCode: HttpStatus.PRECONDITION_REQUIRED, code: 'PRECONDITION_REQUIRED', message }, HttpStatus.PRECONDITION_REQUIRED);
  }
}

export const encodeVersion = (version: number): string =>
  Buffer.from(String(version), 'utf8').toString('base64url');

export const decodeVersion = (value?: string): number => {
  if (!value?.trim()) throw new PreconditionRequiredException('If-Match là bắt buộc.');
  const raw = Buffer.from(value.trim().replace(/^"|"$/g, ''), 'base64url').toString('utf8');
  const version = Number(raw);
  if (!Number.isInteger(version) || version < 0) throw new ConflictException({ code: 'CONCURRENCY_CONFLICT', message: 'Concurrency token không hợp lệ.' });
  return version;
};

export const concurrencyConflict = (version: number): ConflictException =>
  new ConflictException({
    code: 'CONCURRENCY_CONFLICT',
    message: 'Dữ liệu đã thay đổi, vui lòng tải lại.',
    version: encodeVersion(version),
  });
