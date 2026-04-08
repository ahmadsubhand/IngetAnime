import { GetAuthUrl } from '../auth/auth.validation';

interface StateObject {
  mode: GetAuthUrl['mode'];
  state: string;
}

interface GoogleError {
  error: string;
  error_description?: string;
}

export interface JwtPayload {
  sub: number;
  type: 'access_token' | 'reset_password';
}
