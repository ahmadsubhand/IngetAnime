import { GetAuthUrl } from '../auth/auth.validation';
import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatus;
}

export type ApiPagination = {
  paging: {
    prev: string | null;
    next: string | null;
  } | null;
};

export type StateObject = {
  mode: GetAuthUrl['mode'];
  state: string;
};

interface GoogleError {
  error: string;
  error_description?: string;
}

export interface JwtPayload {
  sub: number;
  type: 'access_token' | 'reset_password';
}
