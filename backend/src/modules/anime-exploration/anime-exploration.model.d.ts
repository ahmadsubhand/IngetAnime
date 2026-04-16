import { ApiPagination } from '../../types';
import { MalAnime } from '../../types/mal';
import { AnimeWithRelation } from '../anime/anime.model';

export type AllAnimeWithMal = ApiPagination & {
  anime: (MalAnime & AnimeWithRelation)[];
};
