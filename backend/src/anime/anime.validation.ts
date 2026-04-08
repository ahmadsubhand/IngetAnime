import { z } from 'zod';
import { IndexValidation } from '../validator/index.validation';
import { AnimeStatus } from '../generated/prisma/enums';

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
}

export type CreateAnime = z.infer<typeof AnimeValidation.CREATE_ANIME>;
export type UpdateAnime = z.infer<typeof AnimeValidation.UPDATE_ANIME>;
export type AnimeId = z.infer<typeof AnimeValidation.ANIME_ID>;
