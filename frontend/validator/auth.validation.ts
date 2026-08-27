import { z } from 'zod';

const identifier = z
  .string()
  .min(3, 'Minimal 3 karakter')
  .refine(
    (value) =>
      /^[a-zA-Z0-9_]+$/.test(value) ||
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
    {
      message: 'Harus berupa email atau username yang valid',
    },
  );

const password = z
  .string()
  .min(8, 'Minimal 8 karakter')
  .max(64, 'Maksimal 64 karakter')
  .regex(/[A-Z]/, 'Minimal ada satu huruf kapital')
  .regex(/[a-z]/, 'Minimal ada satu huruf kecil')
  .regex(/[0-9]/, 'Minimal ada satu angka')
  .regex(
    /[@$!%*?&]/,
    'Minimal ada satu karakter khusus (@$!%*?&)',
  );

export class AuthValidation {
  static readonly REGISTER = z
    .object({
      email: z
        .string()
        .email('Format email tidak valid')
        .nonempty('Wajib diisi'),

      password,

      confirmPassword: z
        .string()
        .min(8, 'Minimal 8 karakter'),

      username: z
        .string()
        .min(3, 'Minimal 3 karakter')
        .max(20, 'Maksimal 20 karakter')
        .regex(
          /^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/,
          'Hanya boleh huruf, angka, dan garis bawah (_), serta tidak boleh diawali atau diakhiri garis bawah',
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Konfirmasi kata sandi tidak cocok',
      path: ['confirmPassword'],
    });

  static readonly LOGIN = z.object({
    identifier,
    password: z
      .string()
      .min(8, 'Minimal 8 karakter'),
  });

  static readonly EMAIL_VERIFICATION = z.object({
    otpCode: z
      .string()
      .length(6, 'Harus 6 digit')
      .regex(/^\d+$/, 'Hanya boleh angka'),
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
          'Format token tidak valid',
        ),

      newPassword: password,

      confirmPassword: z
        .string()
        .min(8, 'Minimal terdiri dari 8 karakter'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Konfirmasi kata sandi tidak cocok',
      path: ['confirmPassword'],
    });

  static readonly GET_AUTH_URL = z.object({
    mode: z.enum(['login']),
  });

  static readonly THIRD_PARTY_LOGIN = z.object({
    code: z.string().min(1, 'Kode otorisasi wajib diisi'),
    state: z.string().min(1, 'State autentikasi wajib diisi'),
  });
}

export type Login = z.infer<typeof AuthValidation.LOGIN>;
export type Register = z.infer<typeof AuthValidation.REGISTER>;
export type EmailVerification = z.infer<
  typeof AuthValidation.EMAIL_VERIFICATION
>;
export type ForgotPassword = z.infer<typeof AuthValidation.FORGOT_PASSWORD>;
export type ResetPassword = z.infer<typeof AuthValidation.RESET_PASSWORD>;
export type GetAuthUrl = z.infer<typeof AuthValidation.GET_AUTH_URL>;
export type ThirdPartyLogin = z.infer<typeof AuthValidation.THIRD_PARTY_LOGIN>;