import { z } from 'zod';
import { IndexValidation } from '../validator/index.validation';
import { AnimeStatus } from '../generated/prisma/enums';

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
  private static statusTypeValues = Object.values(AnimeStatus);

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
    releaseAt: IndexValidation.OPTIONAL_DATE.default(null),
    episodeTotal: z.number().int().nonnegative().default(0),
    status: z
      .enum(AnimeStatus, {
        error: `Status must be one of: ${this.statusTypeValues.join(', ')}`,
      })
      .default(AnimeStatus.not_yet_aired),
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
    releaseAt: IndexValidation.OPTIONAL_DATE.optional(),
    episodeTotal: z.number().int().nonnegative().optional(),
    status: z
      .enum(AnimeStatus, {
        error: `Status must be one of: ${this.statusTypeValues.join(', ')}`,
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
