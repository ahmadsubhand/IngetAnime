-- Note
-- In comment, platform refers to AnimePlatform table
-- GREATEST used to avoid negative value

-- Add remaining_watchable_episodes to user_anime_list table
ALTER TABLE user_anime_list 
ADD COLUMN remaining_watchable_episodes INTEGER;

-- Function 1: Trigger from UserAnimeList
CREATE OR REPLACE FUNCTION compute_remaining_watchable()
RETURNS TRIGGER AS $$
BEGIN
    SELECT
      CASE
      	-- Platform exists
        WHEN ap.id IS NOT NULL THEN
          GREATEST(0, ap.episode_aired - NEW.episodes_difference - NEW.progress)
        -- Platform not exists
        WHEN a.status = 'finished_airing' THEN -- If anime finish, take total episode
          GREATEST(0, a.episode_total - NEW.episodes_difference - NEW.progress)
        WHEN a.status = 'not_yet_aired' THEN 0 -- If anime not aired, set to 0
        ELSE NULL -- If anime airing without platform which tracking episode aired, set to null
      END
    INTO NEW.remaining_watchable_episodes
    FROM anime a
    LEFT JOIN LATERAL (
      SELECT ap2.id, ap2.episode_aired
      FROM anime_platform ap2
      WHERE ap2.anime_id = NEW.anime_id
        AND ( -- User has selected platform
          (NEW.anime_platform_id IS NOT NULL AND ap2.id = NEW.anime_platform_id)
          OR -- If not, let the order below select the default platform
          (NEW.anime_platform_id IS NULL)
        )
      ORDER BY ap2.is_main_platform DESC, ap2.platform_id ASC
      LIMIT 1 -- Only 1 platform needed to count remaining watchable episodes
    ) ap ON true
    WHERE a.id = NEW.anime_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on UserAnimeList
CREATE TRIGGER trg_ual_remaining
BEFORE INSERT OR UPDATE OF progress, episodes_difference, anime_platform_id
ON user_anime_list
FOR EACH ROW EXECUTE FUNCTION compute_remaining_watchable();

-- Function 2: Trigger from AnimePlatform
CREATE OR REPLACE FUNCTION compute_remaining_watchable_from_platform()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_anime_list ual
  SET remaining_watchable_episodes = GREATEST(0, NEW.episode_aired - ual.episodes_difference - ual.progress)
  FROM anime a
  WHERE a.id = ual.anime_id
  AND (
    ual.anime_platform_id = NEW.id -- The updated platform is user selected platform
    OR ( -- User doesn't have selected platform
      ual.anime_platform_id IS NULL
      AND ual.anime_id = NEW.anime_id
	  AND ( -- Is updated platform a default platform?
	  	NEW.is_main_platform = TRUE -- Yes. When the updated platform is mark as main platform
	  	OR ( -- Yes. When no platform mark as main platform and the updated platform has lowest platform_id
	  	  NOT EXISTS (
            SELECT 1
            FROM anime_platform ap2
            WHERE ap2.anime_id = NEW.anime_id
              AND ap2.is_main_platform = true
          )
          AND NOT EXISTS (
            SELECT 1
            FROM anime_platform ap2
            WHERE ap2.anime_id = NEW.anime_id
              AND ap2.platform_id < NEW.platform_id
          )
	  	)
	  )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on AnimePlatform
CREATE TRIGGER trg_ap_remaining
AFTER UPDATE OF episode_aired, is_main_platform, platform_id
ON anime_platform
FOR EACH ROW EXECUTE FUNCTION compute_remaining_watchable_from_platform();