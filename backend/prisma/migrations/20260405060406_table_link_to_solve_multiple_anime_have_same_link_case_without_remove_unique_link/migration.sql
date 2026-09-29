/*
  Warnings:

  - You are about to drop the column `link` on the `anime_platform` table. All the data in the column will be lost.
  - Made the column `link_id` on table `anime_platform` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "anime_platform_link_key";

-- AlterTable
ALTER TABLE "anime_platform" DROP COLUMN "link",
ALTER COLUMN "link_id" SET NOT NULL;
