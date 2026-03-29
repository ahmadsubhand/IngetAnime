-- CreateEnum
CREATE TYPE "ListStatus" AS ENUM ('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped');

-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('currently_airing', 'finished_airing', 'not_yet_aired');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('limited_time', 'subscription', 'free');

-- CreateTable
CREATE TABLE "anime_list" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "anime_platform_id" INTEGER,
    "start_date" TIMESTAMP(3),
    "finish_date" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "episodes_difference" INTEGER NOT NULL DEFAULT 0,
    "status" "ListStatus" NOT NULL DEFAULT 'plan_to_watch',
    "isSyncedWithMal" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anime_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime" (
    "id" SERIAL NOT NULL,
    "mal_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "picture" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_id" TEXT,
    "title_en" TEXT,
    "release_at" TIMESTAMP(3),
    "episode_total" INTEGER NOT NULL DEFAULT 0,
    "status" "AnimeStatus" NOT NULL DEFAULT 'not_yet_aired',

    CONSTRAINT "anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_platform" (
    "id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "access_type" "AccessType" NOT NULL,
    "next_episode_airing_at" TIMESTAMP(3),
    "last_episode_aired_at" TIMESTAMP(3),
    "interval_in_days" INTEGER NOT NULL DEFAULT 7,
    "episode_aired" INTEGER NOT NULL DEFAULT 0,
    "is_main_platform" BOOLEAN NOT NULL DEFAULT false,
    "is_hiatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "anime_platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anime_list_user_id_anime_id_key" ON "anime_list"("user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_mal_id_key" ON "anime"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_platform_link_key" ON "anime_platform"("link");

-- CreateIndex
CREATE UNIQUE INDEX "anime_platform_platform_id_anime_id_key" ON "anime_platform"("platform_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_anime_platform_id_fkey" FOREIGN KEY ("anime_platform_id") REFERENCES "anime_platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
