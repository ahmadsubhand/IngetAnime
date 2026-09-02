import { HttpStatusCode } from 'axios';

export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatusCode;
}

export interface User {
  id: number;
  email: string | null;
  username: string;
  picture: string | null;
  isVerified: boolean;
  role: Role;
  malId: number | null;
  googleId: number | null;
  updatedAt: string;
  createdAt: string;
}