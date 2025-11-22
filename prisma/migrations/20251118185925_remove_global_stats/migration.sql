/*
  Warnings:

  - Made the column `guild_id` on table `UserStats` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserStats" DROP CONSTRAINT "UserStats_guild_id_fkey";

-- AlterTable
ALTER TABLE "UserStats" ALTER COLUMN "guild_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
