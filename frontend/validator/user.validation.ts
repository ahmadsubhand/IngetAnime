import z from 'zod';

export class UserValidation {

  public static readonly CHECK_EMAIL = z.object({
    email: z.email(),
  });

  public static readonly CHECK_USERNAME = z.object({
    username: z
      .string()
      .min(3, 'Minimal 3 karakter')
      .max(20, 'Maksimal 20 karakter')
      .regex(
        /^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/,
        'Hanya boleh huruf, angka, dan garis bawah (_), serta tidak boleh diawali atau diakhiri garis bawah',
      ),
  });
}

export type CheckEmail = z.infer<typeof UserValidation.CHECK_EMAIL>;
export type CheckUsername = z.infer<typeof UserValidation.CHECK_USERNAME>;
