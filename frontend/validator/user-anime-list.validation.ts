import z from 'zod';
import { ListStatus } from '../enums';

const OPTIONAL_DATE = z
    .string('Invalid date format. Use YYYY-MM-DD')
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date')
    .transform((value) => (value === '' ? null : value))
    .nullable();

export class UserAnimeListValidation {
  private static statusTypeValues = Object.values(ListStatus);

  public static ANIME_ID = z.object({
    animeId: z.coerce.number().int().positive(),
  });

  public static CREATE_USER_ANIME_LIST = z.object({
    startDate: OPTIONAL_DATE.default(null),
    finishDate: OPTIONAL_DATE.default(null),
    progress: z.number().int().nonnegative().default(0),
    score: z.number().int().min(0).max(10).default(0),
    episodesDifference: z.number().int().nonnegative().default(0),
    status: z
      .enum(ListStatus, {
        error: `Status must be one of: ${this.statusTypeValues.join(', ')}`,
      })
      .default(ListStatus.plan_to_watch),
    isSyncedWithMal: z.boolean().default(false),
    animePlatformId: z.number().int().positive().nullable().default(null),
  });

  public static UPDATE_USER_ANIME_LIST = z.object({
    startDate: OPTIONAL_DATE,
    finishDate: OPTIONAL_DATE,
    progress: z.number().int().nonnegative(),
    score: z.number().int().min(0).max(10),
    episodesDifference: z.number().int().nonnegative(),
    status: z.enum(ListStatus, {
      error: `Status must be one of: ${this.statusTypeValues.join(', ')}`,
    }),
    isSyncedWithMal: z.boolean(),
    animePlatformId: z.number().int().positive().nullable(),
  });

  public static CREATE_OR_UPDATE_USER_ANIME_LIST = z.object({
    startDate: OPTIONAL_DATE.optional(),
    finishDate: OPTIONAL_DATE.optional(),
    progress: z.number().int().nonnegative().optional(),
    score: z.number().int().min(0).max(10).optional(),
    episodesDifference: z.number().int().nonnegative().optional(),
    status: z
      .enum(ListStatus, {
        error: `Status must be one of: ${this.statusTypeValues.join(', ')}`,
      })
      .optional(),
    isSyncedWithMal: z.boolean().optional(),
    animePlatformId: z.number().int().positive().nullable().optional(),
  });
}

export type AnimeId = z.infer<typeof UserAnimeListValidation.ANIME_ID>;
export type CreateUserAnimeList = z.infer<
  typeof UserAnimeListValidation.CREATE_USER_ANIME_LIST
>;
export type UpdateUserAnimeList = z.infer<
  typeof UserAnimeListValidation.UPDATE_USER_ANIME_LIST
>;
export type CreateOrUpdateUserAnimeList = z.infer<
  typeof UserAnimeListValidation.CREATE_OR_UPDATE_USER_ANIME_LIST
>;
