-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "picture" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "otp_code" TEXT,
    "otp_expiration" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "mal_id" TEXT,
    "mal_access_token" TEXT,
    "mal_refresh_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_id_key" ON "users"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_access_token_key" ON "users"("mal_access_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_refresh_token_key" ON "users"("mal_refresh_token");
