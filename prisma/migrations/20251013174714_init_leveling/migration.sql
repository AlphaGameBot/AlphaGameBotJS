-- CreateTable
CREATE TABLE `guild_user_stats` (
    `user_id` BIGINT NOT NULL,
    `guild_id` BIGINT NOT NULL,
    `messages_sent` INTEGER NOT NULL DEFAULT 0,
    `commands_ran` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`user_id`, `guild_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_stats` (
    `user_id` BIGINT NOT NULL,
    `messages_sent` INTEGER NOT NULL DEFAULT 0,
    `commands_ran` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
