-- AlterTable
ALTER TABLE "user_anime_list" RENAME CONSTRAINT "anime_list_pkey" TO "user_anime_list_pkey";

-- RenameForeignKey
ALTER TABLE "user_anime_list" RENAME CONSTRAINT "anime_list_anime_id_fkey" TO "user_anime_list_anime_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_anime_list" RENAME CONSTRAINT "anime_list_anime_platform_id_fkey" TO "user_anime_list_anime_platform_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_anime_list" RENAME CONSTRAINT "anime_list_user_id_fkey" TO "user_anime_list_user_id_fkey";

-- RenameIndex
ALTER INDEX "anime_list_user_id_anime_id_key" RENAME TO "user_anime_list_user_id_anime_id_key";
