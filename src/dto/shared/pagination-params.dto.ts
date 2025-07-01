// DTO tham số phân trang
import { IsInt } from 'class-validator';

export class PaginationParams {
  // Trang hiện tại
  @IsInt()
  pageNumber: number = 1;

  // Số lượng mỗi trang (tối đa 50)
  @IsInt()
  pageSize: number = 10;
}
