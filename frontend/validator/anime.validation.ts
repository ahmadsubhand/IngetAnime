import { AnimeStatus } from '@/enums';
import { z } from 'zod';

const OPTIONAL_DATE = z.iso
  .date('Gunakan format: TTTT-BB-HH')
  .or(z.literal(''))
  .transform((value) => (value === '' ? null : value))
  .nullable();

export class AnimeValidation {
  private static statusTypeValues = Object.values(AnimeStatus);

  static readonly UPDATE_ANIME = z.object({
    picture: z.url('Tautan tidak valid').optional(),
    title: z.string().min(1, 'Minimal 1 karakter').optional(),
    titleEN: z
      .string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .optional(),
    titleID: z
      .string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .optional(),
    releaseAt: OPTIONAL_DATE.optional(),
    episodeTotal: z
      .number('Harus berupa angka')
      .int('Harus bilangan bulat')
      .nonnegative('Tidak boleh bilangan negatif')
      .optional(),
    status: z
      .enum(AnimeStatus, {
        error: `Harus salah satu dari: ${this.statusTypeValues.join(', ')}`,
      })
      .optional(),
  });
}

export type UpdateAnime = z.infer<typeof AnimeValidation.UPDATE_ANIME>;
