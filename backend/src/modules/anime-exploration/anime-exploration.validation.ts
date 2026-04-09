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
  private static defaultFields =
    'id,title,main_picture,alternative_titles,start_date,num_episodes,status';

  private static rankingType = [
    'all',
    'airing',
    'upcoming',
    'tv',
    'ova',
    'movie',
    'special',
    'bypopularity',
    'favorite',
  ];

  private static sort = ['anime_score', 'anime_num_list_users'];

  private static season = ['winter', 'spring', 'summer', 'fall'];

  static readonly GET_ANIME_LIST = z.object({
    q: z.string().min(3),
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
    fields: IndexValidation.FIELDS.default(this.defaultFields),
  });

  static readonly GET_ANIME_RANKING = z.object({
    ranking_type: z.enum(this.rankingType, {
      error: `Ranking type must be one of: ${this.rankingType.join(', ')}`,
    }),
    limit: z.coerce.number().int().min(1).max(500).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
    fields: IndexValidation.FIELDS.default(this.defaultFields),
  });

  static readonly ANIME_SEASON = z.object({
    year: z.coerce.number().int().min(1917),
    season: z.enum(this.season, {
      error: `Season must be one of: ${this.sort.join(', ')}`,
    }),
  });

  static readonly GET_SEASONAL_ANIME = z.object({
    sort: z
      .enum(this.sort, {
        error: `Sort must be one of: ${this.sort.join(', ')}`,
      })
      .optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
    fields: IndexValidation.FIELDS.default(this.defaultFields),
  });

  static readonly GET_SUGGESTED_ANIME = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
    fields: IndexValidation.FIELDS.default(this.defaultFields),
  });
}

export type GetAnimeList = z.infer<
  typeof AnimeExplorationValidation.GET_ANIME_LIST
>;
export type GetAnimeRanking = z.infer<
  typeof AnimeExplorationValidation.GET_ANIME_RANKING
>;
export type AnimeSeason = z.infer<
  typeof AnimeExplorationValidation.ANIME_SEASON
>;
export type GetSeasonalAnime = z.infer<
  typeof AnimeExplorationValidation.GET_SEASONAL_ANIME
>;
export type GetSuggestedAnime = z.infer<
  typeof AnimeExplorationValidation.GET_SUGGESTED_ANIME
>;
