import z from 'zod';
import { IndexValidation } from '../../validator/index.validation';

export class MyAnimeListValidation {
  static readonly ANIME_ID = z.object({
    id: z.coerce.number().int().positive(),
  });

  static readonly FIELDS = z.object({
    fields: IndexValidation.FIELDS.default(''),
  });
}

export type AnimeId = z.infer<typeof MyAnimeListValidation.ANIME_ID>;
export type Fields = z.infer<typeof MyAnimeListValidation.FIELDS>;
