// Interface service cho user (admin)
import { UserDto, CreateUserDto, UpdateUserDto } from './user.dto';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

export interface IUserService {
  getAllUsers(): Promise<UserDto[]>;
  getAllUsersPaged(query: PageQueryDto): Promise<PagedResult<UserDto>>;
  getUserById(id: string): Promise<UserDto | null>;
  createUser(dto: CreateUserDto): Promise<UserDto>;
  updateUser(id: string, dto: UpdateUserDto): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
}
