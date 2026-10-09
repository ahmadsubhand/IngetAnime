import { ListStatus } from '@/enums';
import z from 'zod';

const USERNAME = z
  .string()
  .min(3, 'Minimal 3 karakter')
  .max(20, 'Maksimal 20 karakter')
  .regex(
    /^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/,
    'Hanya boleh huruf, angka, dan garis bawah (_), serta tidak boleh diawali atau diakhiri garis bawah',
  );

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
    remaining_watchable_episodes: 'remaining_watchable_episodes',
  } as const;

  public static ImportType = {
    skip_duplicates: 'skip_duplicates',
    overwrite_all: 'overwrite_all',
    latest_updated: 'latest_updated',
  } as const;

  public static readonly CHECK_EMAIL = z.object({
    email: z.email(),
  });

  public static readonly CHECK_USERNAME = z.object({
    username: USERNAME,
  });

  public static readonly GET_USER_ANIME_LIST = z.object({
    status: z
      .enum(this.ListStatusFilter, {
        error: `Harus salah satu dari: ${Object.values(this.ListStatusFilter).join(', ')}`,
      })
      .default(this.ListStatusFilter.all),
    sort: z
      .enum(this.Sort, {
        error: `Harus salah satu dari: ${Object.values(this.Sort).join(', ')}`,
      })
      .default(this.Sort.anime_id),
    platformId: z.coerce.number().int().nonnegative().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
  });

  public static readonly UPDATE_USER_DETAIL = z.object({
    username: USERNAME,
    email: z
      .email('Email tidak valid')
      .or(z.literal(''))
      .transform((value) => (value === '' ? null : value))
      .nullable(),
  });

  public static readonly IMPORT_ANIME_LIST_FROM_MAL = z.object({
    isSyncedWithMal: z.coerce.boolean(),
    importType: z.enum(this.ImportType, {
      error: `Import type muse be one of: ${Object.values(this.ImportType).join(', ')}`,
    }),
  });
}

export type CheckEmail = z.infer<typeof UserValidation.CHECK_EMAIL>;
export type CheckUsername = z.infer<typeof UserValidation.CHECK_USERNAME>;
export type GetUserAnimeList = z.infer<
  typeof UserValidation.GET_USER_ANIME_LIST
>;
export type UpdateUserDetail = z.infer<
  typeof UserValidation.UPDATE_USER_DETAIL
>;
export type ImportAnimeListFromMal = z.infer<
  typeof UserValidation.IMPORT_ANIME_LIST_FROM_MAL
>;
