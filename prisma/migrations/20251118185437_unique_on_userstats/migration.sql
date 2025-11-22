/*
  Warnings:

  - A unique constraint covering the columns `[user_id,guild_id]` on the table `UserStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserStats_user_id_guild_id_key" ON "UserStats"("user_id", "guild_id");
