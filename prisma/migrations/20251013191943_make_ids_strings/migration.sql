/*
  Warnings:

  - The primary key for the `guild_user_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `guild_user_stats` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(20) NOT NULL,
    MODIFY `guild_id` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `guild_id`);

-- AlterTable
ALTER TABLE `user_stats` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`user_id`);
