import z from 'zod';
import { IndexValidation } from '../../validator/index.validation';

/* 
Parameter explanation:
- userId = user ID in the database, obtained via req.user.id from the token
- q = query string for searching purposes
- limit = maximum number of data to be returned, ranges between 100–500 (varies)
- offset = starting position of the next data for pagination
- fields = returned data fields; if left empty, at least id, title, and main_picture will be returned by default
id, title, main_picture, alternative_titles, start_date, end_date, synopsis, mean, rank, popularity, num_list_users,
num_scoring_users, nsfw, created_at, updated_at, media_type, status, genres, my_list_status, num_episodes, start_season, broadcast,
source, average_episode_duration, rating, pictures, background, related_anime, related_manga, recommendations, studios, statistics
- anime_id = the ID of the anime on MyAnimeList
- ranking_type = type of ranking, only one can be used
all, airing, upcoming, tv, ova, movie, special, bypopularity, favorite
- year = release year of the anime, example: '2025'
- season = release season of the anime, only one can be used
winter, spring, summer, fall
- sort = sorting order for displaying data, only one can be used
anime_score, anime_num_list_users
- status = user's current anime list status, only one can be used
watching, completed, on_hold, dropped, plan_to_watch
- score = score to be given to an anime (1 - 10)
- num_watched_episodes = number of episodes watched
*/

export class AnimeExplorationValidation {
  static readonly GET_ANIME_LIST = z.object({
    q: z.string().min(3),
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(1).default(0),
    fields: IndexValidation.FIELDS.default(
      'id,title,main_picture,alternative_titles,start_date,num_episodes,status',
    ),
  });
}

export type GetAnimeList = z.infer<
  typeof AnimeExplorationValidation.GET_ANIME_LIST
>;
