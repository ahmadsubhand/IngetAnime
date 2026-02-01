import { HttpStatus } from '@nestjs/common';
import { Role } from '../generated/prisma/enums';

export interface JwtPayload {
  sub: number;
  type?: 'reset-password';
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatus;
}

export interface UserResponse {
  id: number;
  username: string;
  picture: string | null;
  role: Role;
  email: string | null;
  isVerified: boolean;
}
