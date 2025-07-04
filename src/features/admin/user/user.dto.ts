// DTO cho user (admin)
import {
  IsUUID,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  Admin = 'Admin',
  Recruiter = 'Recruiter',
  Candidate = 'Candidate',
}

export class UserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  fullName: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @Transform(({ value }) => {
    if (typeof value === 'number') {
      if (value === 0) return UserRole.Admin;
      if (value === 1) return UserRole.Recruiter;
      if (value === 2) return UserRole.Candidate;
    }
    return value;
  })
  @IsEnum(UserRole)
  role: UserRole;
}
