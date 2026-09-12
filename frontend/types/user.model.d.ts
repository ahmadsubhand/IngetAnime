import { ApiPagination } from '.';
import { Role } from '../enums';
import { AnimeWithRelation } from './anime.model';

export type User = {
  id: number;
  email: string | null;
  username: string;
  picture: string | null;
  isVerified: boolean;
  role: Role;
  malId: number | null;
  googleId: number | null;
  updatedAt: string;
  createdAt: string;
};

export type AllAnime = ApiPagination & {
  anime: AnimeWithRelation[];
};
