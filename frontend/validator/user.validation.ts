import { ListStatus } from '@/enums';
import z from 'zod';

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
}

export type CheckEmail = z.infer<typeof UserValidation.CHECK_EMAIL>;
export type CheckUsername = z.infer<typeof UserValidation.CHECK_USERNAME>;
export type GetUserAnimeList = z.infer<
  typeof UserValidation.GET_USER_ANIME_LIST
>;
