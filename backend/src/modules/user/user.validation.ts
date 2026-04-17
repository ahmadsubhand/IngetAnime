import z from 'zod';
import { ListStatus } from '../../generated/prisma/enums';
import { IndexValidation } from '../../validator/index.validation';

export class UserValidation {
  public static ListStatusFilter = {
    ...ListStatus,
    all: 'all',
  } as const;

  public static Sort = {
    list_score: 'list_score',
    list_updated_at: 'list_updated_at',
    anime_release_at: 'anime_release_at',
    anime_title: 'anime_title',
    anime_id: 'anime_id',
    // remaining_watchable_episodes: 'remaining_watchable_episodes',
  } as const;

  public static ImportType = {
    skip_duplicates: 'skip_duplicates',
    overwrite_all: 'overwrite_all',
    latest_updated: 'latest_updated',
  } as const;

  public static readonly GET_USER_ANIME_LIST = z.object({
    status: z
      .enum(this.ListStatusFilter, {
        error: `Status must be one of: ${Object.values(this.ListStatusFilter).join(', ')}`,
      })
      .default(this.ListStatusFilter.all),
    sort: z
      .enum(this.Sort, {
        error: `Sort must be one of: ${Object.values(this.Sort).join(', ')}`,
      })
      .default(this.Sort.anime_id),
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
  });

  public static readonly IMPORT_ANIME_LIST_FROM_MAL = z.object({
    isSyncedWithMal: z.coerce.boolean(),
    importType: z.enum(this.ImportType, {
      error: `Import type muse be one of: ${Object.values(this.ImportType).join(', ')}`,
    }),
  });

  public static readonly CHECK_EMAIL = z.object({
    email: z.email(),
  });

  public static readonly CHECK_USERNAME = z.object({
    username: IndexValidation.USERNAME,
  });

  public static readonly UPDATE_USER_DETAIL = z.object({
    username: IndexValidation.USERNAME,
    email: z.email().nullable(),
  });
}

export type GetUserAnimeList = z.infer<
  typeof UserValidation.GET_USER_ANIME_LIST
>;
export type ImportAnimeListFromMal = z.infer<
  typeof UserValidation.IMPORT_ANIME_LIST_FROM_MAL
>;
export type CheckEmail = z.infer<typeof UserValidation.CHECK_EMAIL>;
export type CheckUsername = z.infer<typeof UserValidation.CHECK_USERNAME>;
export type UpdateUserDetail = z.infer<
  typeof UserValidation.UPDATE_USER_DETAIL
>;
