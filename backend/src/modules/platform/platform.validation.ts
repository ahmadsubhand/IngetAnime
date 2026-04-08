import z from 'zod';

export class PlatformValidation {
  static readonly PLATFORM_NAME = z.object({
    name: z.string().min(3),
  });

  static readonly PLATFORM_ID = z.object({
    id: z.coerce.number().int().positive(),
  });
}

export type PlatformName = z.infer<typeof PlatformValidation.PLATFORM_NAME>;
export type PlatformId = z.infer<typeof PlatformValidation.PLATFORM_ID>;
