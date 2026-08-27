interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  picture: string | null;
  isVerified: boolean;
  role: string;
  malId: number | null;
  googleId: string | null;
  updatedAt: string;
  createdAt: string;
}