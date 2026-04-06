-- AlterTable
ALTER TABLE "anime_platform" ADD COLUMN     "link_id" INTEGER;

-- CreateTable
CREATE TABLE "links" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_url_key" ON "links"("url");

-- AddForeignKey
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
