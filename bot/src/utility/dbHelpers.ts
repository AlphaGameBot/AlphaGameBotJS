// Helper utilities for ensuring DB parent rows exist (User, Guild).
// These helpers are intended to be used with a Prisma transaction client (`tx`).
// They also provide a variant to ensure users by id when only the id is available.

import type { Guild as DjsGuild, User as DjsUser } from "discord.js";

/**
 * Ensure the given Discord `User` exists in the database.
 * If the user is a bot (`user.bot === true`), the function is a no-op.
 */
export async function ensureUser(tx: any, user: { id: string; username?: string; discriminator?: string; bot?: boolean } | DjsUser) {
    // If we were passed a full Discord User, honor the bot flag.
    if ((user as any).bot) return;

    const id = (user as any).id;
    const username = (user as any).username ?? `unknown-${id}`;
    const discriminator = (user as any).discriminator ?? "0000";

    await tx.user.upsert({
        where: { id },
        create: { id, username, discriminator },
        update: { username, discriminator }
    });
}

/**
 * Ensure a User row exists when only the id (and optional names) are available.
 * This variant cannot detect bot users and will always create/update the row.
 */
export async function ensureUserById(tx: any, id: string, username = `unknown-${id}`, discriminator = "0000") {
    await tx.user.upsert({
        where: { id },
        create: { id, username, discriminator },
        update: { username }
    });
}

export async function ensureGuild(tx: any, guild: { id: string; name?: string } | DjsGuild) {
    const id = (guild as any).id;
    const name = (guild as any).name ?? `unknown-${id}`;

    await tx.guild.upsert({
        where: { id },
        create: { id, name },
        update: { name }
    });
}

export default { ensureUser, ensureUserById, ensureGuild };
