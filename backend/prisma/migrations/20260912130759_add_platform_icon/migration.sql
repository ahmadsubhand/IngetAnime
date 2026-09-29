/*
  Warnings:

  - Added the required column `height` to the `platforms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `platforms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratio` to the `platforms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `platforms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platforms" ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "ratio" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
