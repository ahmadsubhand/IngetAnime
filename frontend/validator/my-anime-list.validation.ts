import z from 'zod';

const FIELDS = z
    .string()
    .regex(
      /^$|^[^,\s]+(,[^,\s]+)*$/,
      'Invalid format. Value must be seperated by comma without any space',
    );

export class MyAnimeListValidation {
  static readonly ANIME_ID = z.object({
    id: z.coerce.number().int().positive(),
  });

  static readonly FIELDS = z.object({
    fields: FIELDS.default(''),
  });
}

export type AnimeId = z.infer<typeof MyAnimeListValidation.ANIME_ID>;
export type Fields = z.infer<typeof MyAnimeListValidation.FIELDS>;
