import { AnimeValidation } from './anime.validation';
import { AnimeStatus } from '../../generated/prisma/enums';

describe('AnimeValidation', () => {
  describe('CREATE_ANIME', () => {
    it('should create anime', () => {
      const result = AnimeValidation.CREATE_ANIME.parse({
        malId: 1,
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
        titleEN: 'Naruto',
        titleID: 'Naruto',
        releaseAt: '2026-05-03',
        episodeTotal: 100,
        status: 'finished_airing',
      });

      expect(result.malId).toBe(1);
      expect(result.picture).toBe('https://example.com/image.jpg');
      expect(result.title).toBe('Naruto');

      // default values
      expect(result.titleEN).toBe('Naruto');
      expect(result.titleID).toBe('Naruto');
      expect(result.releaseAt).toBe('2026-05-03');
      expect(result.episodeTotal).toBe(100);
      expect(result.status).toBe(AnimeStatus.finished_airing);
    });

    it('should parse valid minimal input and apply defaults', () => {
      const result = AnimeValidation.CREATE_ANIME.parse({
        malId: 1,
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
      });

      expect(result.malId).toBe(1);
      expect(result.picture).toBe('https://example.com/image.jpg');
      expect(result.title).toBe('Naruto');

      // default values
      expect(result.titleEN).toBeNull();
      expect(result.titleID).toBeNull();
      expect(result.releaseAt).toBeNull();
      expect(result.episodeTotal).toBe(0);
      expect(result.status).toBe(AnimeStatus.not_yet_aired);
    });

    it('should transform empty string to null', () => {
      const result = AnimeValidation.CREATE_ANIME.parse({
        malId: 1,
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
        titleEN: '',
        titleID: '',
      });

      expect(result.titleEN).toBeNull();
      expect(result.titleID).toBeNull();
    });

    it('should accept null value', () => {
      const result = AnimeValidation.CREATE_ANIME.parse({
        malId: 1,
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
        titleEN: null,
        titleID: null,
      });

      expect(result.titleEN).toBeNull();
      expect(result.titleID).toBeNull();
    });

    it('should accept valid enum status', () => {
      const result = AnimeValidation.CREATE_ANIME.parse({
        malId: 1,
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
        status: AnimeStatus.finished_airing,
      });

      expect(result.status).toBe(AnimeStatus.finished_airing);
    });

    it('should throw error for invalid status', () => {
      expect(() =>
        AnimeValidation.CREATE_ANIME.parse({
          malId: 1,
          picture: 'https://example.com/image.jpg',
          title: 'Naruto',
          status: 'invalid_status',
        }),
      ).toThrow();
    });

    it('should throw error for invalid malId', () => {
      expect(() =>
        AnimeValidation.CREATE_ANIME.parse({
          malId: -1,
          picture: 'https://example.com/image.jpg',
          title: 'Naruto',
        }),
      ).toThrow();
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        AnimeValidation.CREATE_ANIME.parse({
          malId: 1,
          picture: 'not-a-url',
          title: 'Naruto',
        }),
      ).toThrow();
    });
  });

  describe('ANIME_ID', () => {
    it('should coerce string to number', () => {
      const result = AnimeValidation.ANIME_ID.parse({
        id: '1',
      });

      expect(result.id).toBe(1);
    });

    it('should throw error if id is not positive', () => {
      expect(() =>
        AnimeValidation.ANIME_ID.parse({
          id: 0,
        }),
      ).toThrow();
    });
  });

  describe('UPDATE_ANIME', () => {
    it('should update full anime', () => {
      const result = AnimeValidation.UPDATE_ANIME.parse({
        picture: 'https://example.com/image.jpg',
        title: 'Naruto',
        titleEN: 'Naruto',
        titleID: 'Naruto',
        releaseAt: '2026-05-03',
        episodeTotal: 100,
        status: 'finished_airing',
      });

      expect(result.picture).toBe('https://example.com/image.jpg');
      expect(result.title).toBe('Naruto');

      // default values
      expect(result.titleEN).toBe('Naruto');
      expect(result.titleID).toBe('Naruto');
      expect(result.releaseAt).toBe('2026-05-03');
      expect(result.episodeTotal).toBe(100);
      expect(result.status).toBe(AnimeStatus.finished_airing);
    });

    it('should allow partial update', () => {
      const result = AnimeValidation.UPDATE_ANIME.parse({
        title: 'One Piece',
      });

      expect(result.title).toBe('One Piece');
    });

    it('should transform empty string to null in optional fields', () => {
      const result = AnimeValidation.UPDATE_ANIME.parse({
        titleEN: '',
        titleID: '',
      });

      expect(result.titleEN).toBeNull();
      expect(result.titleID).toBeNull();
    });

    it('should accept valid enum status', () => {
      const result = AnimeValidation.UPDATE_ANIME.parse({
        status: AnimeStatus.currently_airing,
      });

      expect(result.status).toBe(AnimeStatus.currently_airing);
    });

    it('should throw error for invalid status', () => {
      expect(() =>
        AnimeValidation.UPDATE_ANIME.parse({
          status: 'invalid_status',
        }),
      ).toThrow();
    });

    it('should throw error for invalid episodeTotal', () => {
      expect(() =>
        AnimeValidation.UPDATE_ANIME.parse({
          episodeTotal: -5,
        }),
      ).toThrow();
    });
  });
});
