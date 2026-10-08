import { AccessType } from '@/enums';
import z from 'zod';

const OPTIONAL_DATE_TIME = z.iso
  .datetime({
    local: true,
    precision: -1,
    error: 'Gunakan format: YYYY-MM-DDTHH:mm',
  })
  .or(z.literal(''))
  .transform((value) => (value === '' ? null : value))
  .nullable();

export class AnimePlatformValidation {
  private static accessTypeValues = Object.values(AccessType);

  static readonly CREATE_OR_UPDATE_ANIME_PLATFORM = z.object({
    link: z.url('Tautan tidak valid'),
    accessType: z
      .enum(AccessType, {
        error: `Harus salah satu dari: ${this.accessTypeValues.join(', ')}`,
      })
      .optional(),
    nextEpisodeAiringAt: OPTIONAL_DATE_TIME.optional(),
    lastEpisodeAiredAt: OPTIONAL_DATE_TIME.optional(),
    intervalInDays: z
      .number()
      .int()
      .positive('Harus berupa bilangan positif')
      .optional(),
    episodeAired: z
      .number('Harus berupa angka')
      .int('Harus bilangan bulat')
      .nonnegative('Tidak boleh bilangan negatif')
      .optional(),
    isMainPlatform: z.boolean().optional(),
    isHiatus: z.boolean().optional(),
  });
}

export type CreateOrUpdateAnimePlatform = z.infer<
  typeof AnimePlatformValidation.CREATE_OR_UPDATE_ANIME_PLATFORM
>;
