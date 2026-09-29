import z from 'zod';
import { IndexValidation } from '../../validator/index.validation';
import { ListStatus } from '../../generated/prisma/enums';

export class UserAnimeListValidation {
  private static statusTypeValues = Object.values(ListStatus);

  public static ANIME_ID = z.object({
    animeId: z.coerce.number().int().positive(),
  });

  public static CREATE_USER_ANIME_LIST = z.object({
    startDate: IndexValidation.OPTIONAL_DATE.default(null),
    finishDate: IndexValidation.OPTIONAL_DATE.default(null),
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
    startDate: IndexValidation.OPTIONAL_DATE,
    finishDate: IndexValidation.OPTIONAL_DATE,
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
    startDate: IndexValidation.OPTIONAL_DATE.optional(),
    finishDate: IndexValidation.OPTIONAL_DATE.optional(),
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
