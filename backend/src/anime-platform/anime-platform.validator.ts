import z from 'zod';
import { AccessType } from '../generated/prisma/enums';
import { IndexValidation } from '../validator/index.validator';

export class AnimePlatformValidation {
  private static accessTypeValues = Object.values(AccessType);

  static readonly ANIME_PLATFORM_ID = z.object({
    animeId: z.coerce.number().int().positive(),
    platformId: z.coerce.number().int().positive(),
  });

  static readonly CREATE_ANIME_PLATFORM = z.object({
    link: z.url(),
    accessType: z.enum(AccessType, {
      error: `Access type must be one of: ${this.accessTypeValues.join(', ')}`,
    }),
    nextEpisodeAiringAt: IndexValidation.OPTIONAL_DATE_TIME.default(null),
    lastEpisodeAiredAt: IndexValidation.OPTIONAL_DATE_TIME.default(null),
    intervalInDays: z.number().int().positive().default(7),
    episodeAired: z.number().int().nonnegative().default(0),
    isMainPlatform: z.boolean().default(false),
    isHiatus: z.boolean().default(false),
  });

  static readonly UPDATE_ANIME_PLATFORM = z.object({
    link: z.url(),
    accessType: z.enum(AccessType, {
      error: `Access type must be one of: ${this.accessTypeValues.join(', ')}`,
    }),
    nextEpisodeAiringAt: IndexValidation.OPTIONAL_DATE_TIME,
    lastEpisodeAiredAt: IndexValidation.OPTIONAL_DATE_TIME,
    intervalInDays: z.number().int().positive(),
    episodeAired: z.number().int().nonnegative(),
    isMainPlatform: z.boolean(),
    isHiatus: z.boolean(),
  });

  static readonly CREATE_OR_UPDATE_ANIME_PLATFORM = z.object({
    link: z.url().optional(),
    accessType: z
      .enum(AccessType, {
        error: `Access type must be one of: ${this.accessTypeValues.join(', ')}`,
      })
      .optional(),
    nextEpisodeAiringAt: IndexValidation.OPTIONAL_DATE_TIME.optional(),
    lastEpisodeAiredAt: IndexValidation.OPTIONAL_DATE_TIME.optional(),
    intervalInDays: z.number().int().positive().optional(),
    episodeAired: z.number().int().nonnegative().optional(),
    isMainPlatform: z.boolean().optional(),
    isHiatus: z.boolean().optional(),
  });
}

export type AnimePlatformId = z.infer<
  typeof AnimePlatformValidation.ANIME_PLATFORM_ID
>;
export type CreateAnimePlatform = z.infer<
  typeof AnimePlatformValidation.CREATE_ANIME_PLATFORM
>;
export type UpdateAnimePlatform = z.infer<
  typeof AnimePlatformValidation.UPDATE_ANIME_PLATFORM
>;
export type CreateOrUpdateAnimePlatform = z.infer<
  typeof AnimePlatformValidation.CREATE_OR_UPDATE_ANIME_PLATFORM
>;
