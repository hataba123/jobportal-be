// DTO trả về kết quả phân trang
import { IsArray, IsInt } from 'class-validator';

export class PagedResult<T> {
  // Danh sách kết quả
  @IsArray()
  items: T[];

  // Tổng số bản ghi
  @IsInt()
  totalItems: number;

  // Trang hiện tại
  @IsInt()
  pageNumber: number;

  // Số lượng mỗi trang
  @IsInt()
  pageSize: number;

  // Có trang tiếp theo không
  hasNext: boolean;

  // Có trang trước không
  hasPrevious: boolean;

  // Tổng số trang
  totalPages: number;
}
