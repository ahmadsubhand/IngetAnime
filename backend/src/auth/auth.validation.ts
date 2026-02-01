import { z } from 'zod';

const identifier = z
  .string()
  .min(3, 'Indentifier must be at least 3 characters long')
  .refine(
    (value) =>
      /^[a-zA-Z0-9_]+$/.test(value) ||
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    {
      message: 'Identifier must be a valid email or username',
    },
  );

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password must not exceed 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(
    /[@$!%*?&]/,
    'Password must contain at least one special character (@$!%*?&)',
  );

export class AuthValidation {
  static readonly REGISTER = z
    .object({
      email: z.email().nonempty(),
      password,
      confirmPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must not exceed 20 characters')
        .regex(
          /^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/,
          'Username can only contain letters, numbers, and underscores, but cannot start or end with an underscore',
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  static readonly LOGIN = z.object({
    identifier,
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  });

  static readonly EMAIL_VERIFICATION = z.object({
    otpCode: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
  });

  static readonly FORGOT_PASSWORD = z.object({
    identifier,
  });

  static readonly RESET_PASSWORD = z
    .object({
      token: z
        .string()
        .regex(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
          'Invalid token format',
        ),
      newPassword: password,
      confirmPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
}

export type Login = z.infer<typeof AuthValidation.LOGIN>;
export type Register = z.infer<typeof AuthValidation.REGISTER>;
export type EmailVerification = z.infer<
  typeof AuthValidation.EMAIL_VERIFICATION
>;
export type ForgotPassword = z.infer<typeof AuthValidation.FORGOT_PASSWORD>;
export type ResetPassword = z.infer<typeof AuthValidation.RESET_PASSWORD>;
