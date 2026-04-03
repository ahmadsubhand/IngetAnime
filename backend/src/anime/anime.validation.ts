import { z } from 'zod';

export const idBody = z.number().int().positive();

export const link = z.url();

export const limit = (min: number, max: number) => {
  return z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= min && val <= max, {
      message: `Limit is integer number between ${min} and ${max}`,
    });
};

export const offset = z
  .string()
  .transform((val) => Number(val))
  .refine((val) => Number.isInteger(val) && val >= 0, {
    message: `Offset is integer number start from 0`,
  });

export const fields = z.string().regex(/^[^,\s]+(,[^,\s]+)*$/, {
  message: 'Invalid format. Value must be seperated by comma without any space',
});

export class AnimeValidation {
  static readonly CREATE_ANIME = z.object({
    malId: z.number().int().positive(),
    picture: z.url(),
    title: z.string().min(1),
    titleEN: z
      .string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .default(null),
    titleID: z
      .string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .default(null),
    releaseAt: z
      .string('Invalid date format. Use YYYY-MM-DD')
      .regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
      .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date')
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .default(null),
    episodeTotal: z.number().int().nonnegative().default(0),
    status: z
      .enum(['currently_airing', 'finished_airing', 'not_yet_aired'], {
        error:
          'status must be one of: currently_airing, finished_airing, or not_yet_aired',
      })
      .default('not_yet_aired'),
  });

  static readonly ANIME_ID = z.object({
    id: z.coerce.number().int().positive(),
  });

  static readonly UPDATE_ANIME = z.object({
    picture: z.url().optional(),
    title: z.string().min(1).optional(),
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
    releaseAt: z
      .string('Invalid date format. Use YYYY-MM-DD')
      .regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
      .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date')
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .optional(),
    episodeTotal: z.number().int().nonnegative().optional(),
    status: z
      .enum(['currently_airing', 'finished_airing', 'not_yet_aired'], {
        error:
          'status must be one of: currently_airing, finished_airing, or not_yet_aired',
      })
      .optional(),
  });

  static readonly GET_ANIME_LIST = z.object({
    q: z.string().min(3),
    limit: limit(1, 100).optional(),
    offset: offset.optional(),
    fields: fields.optional(),
  });
}

export type CreateAnime = z.infer<typeof AnimeValidation.CREATE_ANIME>;
export type UpdateAnime = z.infer<typeof AnimeValidation.UPDATE_ANIME>;
export type AnimeId = z.infer<typeof AnimeValidation.ANIME_ID>;
export type GetAnimeList = z.infer<typeof AnimeValidation.GET_ANIME_LIST>;
