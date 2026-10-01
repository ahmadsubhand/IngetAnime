import api from '../lib/axios';
import { ApiResponse } from '../types';
import { Link } from '../types/anime-platform.model';
import { Anime } from '../types/anime.model';
import { Platform } from '../types/platform.model';
import { UserAnimeList, UserAnimeListWithRelation } from '../types/user-anime-list.model';
import { CreateOrUpdateUserAnimeList } from '../validator/user-anime-list.validation';

function getPrefix(animeId: number)  {
  return `/anime/${animeId.toString()}/my-list-status`
}

export const userAnimeListService = {
  async createOrUpdate(payload: CreateOrUpdateUserAnimeList, animeId: number) {
    const { data } = await api.patch<ApiResponse<UserAnimeListWithRelation>>(
      `${getPrefix(animeId)}`,
      payload,
    );
    return data;
  },

  async delete(animeId: number) {
    const { data } = await api.delete<ApiResponse<
      {
        id: UserAnimeList['id'];
        isSyncedWithMal: UserAnimeList['isSyncedWithMal'];
      } & {
        anime: {
          title: Anime['title'];
          malId: Anime['malId'];
        };
      } & {
        animePlatform: {
          platform: {
            name: Platform['name'];
          };
          link: {
            url: Link['url'];
          };
        } | null;
      }
    >>(
      `${getPrefix(animeId)}`,
    );
    return data;
  },
}

export default userAnimeListService;