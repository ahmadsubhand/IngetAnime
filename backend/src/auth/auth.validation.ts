import { z } from 'zod';

export class AuthValidation {
  static readonly Login = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  });
}

export type Login = z.infer<typeof AuthValidation.Login>;
