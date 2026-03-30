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

interface MalToken {
  token_type: 'Bearer';
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface MalProfile {
  id: number;
  name: string;
  gender?: 'male' | 'female';
  birthday: string;
  location: string;
  joined_at: string;
  picture?: string;
}

interface MalError {
  error: string;
  message?: string;
  hint?: string;
}
