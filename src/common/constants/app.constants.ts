// Các hằng số chung của ứng dụng
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx'] as const,
  UPLOAD_PATHS: {
    CV: 'uploads/cv',
    LOGO: 'uploads/logo',
    IMAGES: 'uploads/images',
  },

  // Cache TTL
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
  },

  // Validation
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
} as const;

// Enum cho các loại file được phép
export enum AllowedFileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
}

// Error messages tiếng Việt theo instruction
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Truy cập bị từ chối',
  NOT_FOUND: 'Không tìm thấy tài nguyên',
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ',
  INTERNAL_ERROR: 'Lỗi hệ thống',
  FILE_TOO_LARGE: 'File quá lớn',
  FILE_TYPE_NOT_ALLOWED: 'Định dạng file không được phép',
} as const;
