import { z } from 'zod';

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
  static readonly GET_ANIME_LIST = z.object({
    q: z.string().min(3, 'Indentifier must be at least 3 characters long'),
    limit: limit(1, 100).optional(),
    offset: offset.optional(),
    fields: fields.optional(),
  });
}

export type GetAnimeList = z.infer<typeof AnimeValidation.GET_ANIME_LIST>;
