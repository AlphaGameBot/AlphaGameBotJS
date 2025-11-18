/*
  SPDX-License-Identifier: GPL-3.0-or-later
  Copyright (c) AlphaGameBot contributors
  Migration helper: copy data from MySQL (old schema) into Prisma-managed DB.
*/

import { REST } from "@discordjs/rest";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { existsSync, mkdirSync, readFileSync, writeFile } from "node:fs";
import { styleText } from "node:util";

dotenv.config();

const SOURCE_URL = process.env.SOURCE_MYSQL_URL;
if (!SOURCE_URL) {
    console.error("Please set SOURCE_MYSQL_URL in your environment (.env).");
    process.exit(1);
}

const prisma = new PrismaClient();

const cacheDir = "/mnt/archive/agb-migration-cache"; // store discord api responses here

async function main() {
    const djsrest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    djsrest.on('rateLimited', (info) => {
        // {"global":false,"method":"GET","url":"https://discord.com/api/v10/users/1253458687520149515","route":"/users/:id","majorParameter":"global","hash":"481e0bf1883da82f2e83411bc2da9c89","limit":30,"timeToReset":29549,"retryAfter":29549,"sublimitTimeout":0,"scope":"user"}
        const seconds = (info.retryAfter / 1000).toFixed(1);

        const retryMs = info.retryAfter ?? 0;
        const endAt = Date.now() + retryMs;

        // print initial message on single line (we'll overwrite it)
        const formatMsg = (secs) =>
            styleText(
                ["yellow", "bold"],
                `[!] Rate limited on ${info.method} ${info.url} - Continuing in ${secs} seconds...`
            );

        const writeLine = (str) => {
            // move cursor to line start and write (works in most terminals)
            if (process.stdout.clearLine) process.stdout.clearLine(0);
            if (process.stdout.cursorTo) process.stdout.cursorTo(0);
            process.stdout.write(str);
        };

        // if retry is <= 1s, just log once and don't start the countdown
        if (retryMs <= 1000) {
            writeLine(formatMsg((retryMs / 1000).toFixed(1)) + "\n");
            return;
        }

        // initial write
        writeLine(formatMsg(Math.ceil(retryMs / 1000)));

        const interval = setInterval(() => {
            const remaining = endAt - Date.now();

            // stop updating when we're within 1 second of retry
            if (remaining <= 1000) {
                clearInterval(interval);
                // finalize line (move to next line)
                writeLine(formatMsg("<=1") + "\n");
                return;
            }

            const secs = Math.ceil(remaining / 1000);
            writeLine(formatMsg(secs));
        }, 1000);
    });
    const conn = await mysql.createConnection(SOURCE_URL);

    /**
     * Fetch a JSON-able resource from Discord and cache it to disk. If the cache exists, load from it.
     * This helper is intended only for Discord API responses (not DB rows).
     * - path: absolute path to cache file
     * - fetcher: async function that returns the value to cache
     */
    async function cachedGet(path, fetcher) {
        try {
            if (existsSync(path)) {
                const d = readFileSync(path, 'utf-8');
                return JSON.parse(d);
            }
        } catch (e) {
            console.error(`Failed to load cache ${path}:`, e);
            // fallthrough to refetch
            // FAKE A 404
            throw { status: 404 };
        }

        try {
            const val = await fetcher();
            writeFile(path, JSON.stringify(val, null, 2), (err) => {
                if (err) console.error(`Failed to write cache ${path}:`, err);
            });
            return val;
        } catch (e) {
            // Handle Discord API 404 (resource not found) gracefully by returning null so callers
            // can fall back to DB rows without the script crashing.
            const status = e && (e.status || e.statusCode || (e.body && e.body.status));
            if (status === 404) {
                console.warn(`Discord API returned 404 for cache ${path} - treating as missing resource.`);
                return null;
            }
            console.error(`Failed to fetch remote for cache ${path}:`, e);
            throw e;
        }
    }
    try {
        console.log("Connected to source MySQL, starting migration...");

        // load all source data first
        const [usersRows] = await conn.query("SELECT id, last_seen FROM users");
        const users = Array.isArray(usersRows) ? usersRows : [];
        console.log(`Found ${users.length} users.`);

        const [globalRows] = await conn.query("SELECT user_id, messages_sent, commands_ran FROM user_stats");
        const globalStats = Array.isArray(globalRows) ? globalRows : [];
        console.log(`Found ${globalStats.length} global user_stats.`);

        const [guildRows] = await conn.query(
            "SELECT user_id, guild_id, messages_sent, commands_ran, last_announced_level FROM guild_user_stats"
        );
        const guildStats = Array.isArray(guildRows) ? guildRows : [];
        console.log(`Found ${guildStats.length} guild_user_stats rows.`);

        const [errsRows] = await conn.query("SELECT id, user_id, guild_id, error_msg, created_at FROM error_reports");
        const errs = Array.isArray(errsRows) ? errsRows : [];
        console.log(`Found ${errs.length} error_reports.`);

        // 1) Upsert any real users from source users table
        let count = 0;
        for (const u of users) {
            const percent = ((count / users.length) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Processing users: ${count}/${users.length} (${u.id})\r`);
            count++;

            // use the rest client to get the id

            /** @type User */
            // save it in cacheDir/users/{id}.json using a reusable cachedGet helper
            mkdirSync(`${cacheDir}/users`, { recursive: true });

            /**
             * Fetch a JSON-able resource and cache it to disk. If the cache exists, load from it.
             * - path: absolute path to cache file
             * - fetcher: async function that returns the value to cache
             */
            async function cachedGet(path, fetcher) {
                try {
                    if (existsSync(path)) {
                        // dynamic import expects file:// URI
                        // read file content
                        const d = readFileSync(path, 'utf-8');
                        return JSON.parse(d);
                    }
                } catch (e) {
                    console.error(`Failed to load cache ${path}:`, e);
                    // fallthrough to refetch
                }

                // fetch and write cache (fire-and-forget write errors are logged)
                try {
                    const val = await fetcher();
                    writeFile(path, JSON.stringify(val, null, 2), (err) => {
                        if (err) console.error(`Failed to write cache ${path}:`, err);
                    });
                    return val;
                } catch (e) {
                    const status = e && (e.status || e.statusCode || (e.body && e.body.status));
                    if (status === 404) {
                        console.warn(`Discord API returned 404 for cache ${path} - treating as missing resource.`);
                        return null;
                    }
                    console.error(`Failed to fetch remote for cache ${path}:`, e);
                    throw e;
                }
            }

            const cachePath = `${cacheDir}/users/${u.id}.json`;
            let userData;
            try {
                userData = await cachedGet(cachePath, async () => {
                    return await djsrest.get(`/users/${u.id}`);
                });
            } catch (e) {
                // If fetch fails, keep using the source row fields and continue
                console.error(`Could not obtain user ${u.id} from Discord; using DB row fallback.`);
                userData = {};
            }

            // merge any fields we need back onto the source row object
            if (userData && typeof userData === 'object') {
                Object.assign(u, userData);
            }
            const lastSeen = u.last_seen ? new Date(u.last_seen) : new Date();
            await prisma.user.upsert({
                where: { id: u.id },
                update: { last_login: lastSeen },
                create: {
                    id: u.id,
                    username: (u && u.username) || `unknown-${u.id}`,
                    discriminator: (u && u.discriminator) || '0000',
                    created_at: lastSeen,
                    last_login: lastSeen,
                },
            });
        }

        // 1b) Ensure all user_ids referenced by stats/error_reports exist (create placeholders)
        const referencedUserIds = new Set();
        globalStats.forEach(s => referencedUserIds.add(s.user_id));
        guildStats.forEach(s => referencedUserIds.add(s.user_id));
        errs.forEach(e => referencedUserIds.add(e.user_id));

        console.log("*** Ensuring referenced users from stats and error_reports ***");
        count = 0;
        for (const uid of referencedUserIds) {
            const percent = ((count / referencedUserIds.size) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Ensuring referenced users: ${count}/${referencedUserIds.size} (${uid})\r`);
            count++;
        }
        for (const uid of referencedUserIds) {
            // upsert with a harmless update to avoid empty update object
            const u = await cachedGet(`${cacheDir}/users/${uid}.json`, async () => {
                return await djsrest.get(`/users/${uid}`);
            }).catch(() => null);

            await prisma.user.upsert({
                where: { id: uid },
                update: { last_login: new Date() },
                create: {
                    id: uid,
                    username: (u && u.username) || `unknown-${uid}`,
                    discriminator: (u && u.discriminator) || '0000',
                    created_at: new Date(),
                    last_login: new Date(),
                },
            });
        }

        // 2) Migrate global user_stats (user_stats)
        count = 0;
        for (const s of globalStats) {
            const percent = ((count / globalStats.length) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Processing global stats: ${count}/${globalStats.length} (${s.user_id})\r`);
            count++;
            const existing = await prisma.userStats.findFirst({
                where: { user_id: s.user_id, guild_id: null },
            });
            if (existing) {
                await prisma.userStats.update({
                    where: { id: existing.id },
                    data: { messages_sent: s.messages_sent, commands_ran: s.commands_ran },
                });
            } else {
                await prisma.userStats.create({
                    data: {
                        user_id: s.user_id,
                        guild_id: null,
                        messages_sent: s.messages_sent,
                        commands_ran: s.commands_ran,
                        last_announced_level: 0,
                    },
                });
            }
        }

        // 3) Migrate per-guild stats (guild_user_stats) and ensure Guild rows exist
        count = 0;
        const guildIds = Array.from(new Set(guildStats.map((r) => r.guild_id)));
        for (const gid of guildIds) {
            const percent = ((count / guildIds.length) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Ensuring guilds: ${count}/${guildIds.length} (${gid})\r`);
            count++;
            const g = await cachedGet(`${cacheDir}/guilds/${gid}.json`, async () => {
                return await djsrest.get(`/guilds/${gid}`);
            }).catch(() => null);

            await prisma.guild.upsert({
                where: { id: gid },
                update: { updated_at: new Date() },
                create: { id: gid, name: (g && g.name) || `unknown-${gid}`, created_at: new Date(), updated_at: new Date() },
            });
        }

        count = 0;
        for (const s of guildStats) {
            const percent = ((count / guildStats.length) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Processing guild stats: ${count}/${guildStats.length} (${s.user_id} @ ${s.guild_id})\r`);
            count++;
            const existing = await prisma.userStats.findFirst({
                where: { user_id: s.user_id, guild_id: s.guild_id },
            });
            if (existing) {
                await prisma.userStats.update({
                    where: { id: existing.id },
                    data: {
                        messages_sent: s.messages_sent,
                        commands_ran: s.commands_ran,
                        last_announced_level: s.last_announced_level ?? existing.last_announced_level,
                    },
                });
            } else {
                await prisma.userStats.create({
                    data: {
                        user_id: s.user_id,
                        guild_id: s.guild_id,
                        messages_sent: s.messages_sent,
                        commands_ran: s.commands_ran,
                        last_announced_level: s.last_announced_level ?? 0,
                    },
                });
            }
        }

        // 4) Migrate error_reports (preserve ids and timestamps)
        count = 0;
        for (const e of errs) {
            const percent = ((count / errs.length) * 100).toFixed(2);
            process.stdout.write(`[${percent}%]  Processing error reports: ${count}/${errs.length} (${e.id})\r`);
            count++;
            const exists = await prisma.errorReport.findUnique({ where: { id: e.id } });
            const createdAt = e.created_at ? new Date(e.created_at) : new Date();
            if (exists) {
                await prisma.errorReport.update({
                    where: { id: e.id },
                    data: {
                        error_msg: e.error_msg,
                        user_id: e.user_id,
                        guild_id: e.guild_id ?? null,
                        created_at: createdAt,
                    },
                });
            } else {
                await prisma.errorReport.create({
                    data: {
                        id: e.id,
                        user_id: e.user_id,
                        guild_id: e.guild_id ?? null,
                        error_msg: e.error_msg,
                        created_at: createdAt,
                    },
                });
            }
        }

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
        process.exitCode = 2;
    } finally {
        await prisma.$disconnect();
        await conn.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});