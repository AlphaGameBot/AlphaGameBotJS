# This file is a part of AlphaGameBot.
# 
#     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
#     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
# 
#     AlphaGameBot is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
# 
#     AlphaGameBot is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
# 
#     You should have received a copy of the GNU General Public License
#     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

import mysql.connector # pyright: ignore[reportMissingImports]
from datetime import datetime

# --- Configuration ---
OLD_DB = {
    "host": "10.0.0.6",
    "user": "admin",
    "password": "InsertYourPasswordPlease",
    "database": "alphagamebot"
}

NEW_DB = {
    "host": "10.7.1.2",
    "user": "admin",
    "password": "InsertYourPasswordPlease",
    "database": "alphagamebot"
}

# --- Connect to both databases ---
old_conn = mysql.connector.connect(**OLD_DB)
new_conn = mysql.connector.connect(**NEW_DB)
old_cur = old_conn.cursor(dictionary=True)
new_cur = new_conn.cursor()

print("[1] Migrating user_stats...")
old_cur.execute("SELECT * FROM user_stats")
rows = old_cur.fetchall()
for row in rows:
    new_cur.execute("""
        INSERT INTO user_stats (user_id, messages_sent, commands_ran)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE messages_sent = VALUES(messages_sent), commands_ran = VALUES(commands_ran)
    """, (str(row["userid"]), row["messages_sent"], row["commands_ran"]))
new_conn.commit()
print(f"  → Migrated {len(rows)} user_stats rows")

print("[2] Migrating guild_user_stats...")
old_cur.execute("SELECT * FROM guild_user_stats")
rows = old_cur.fetchall()
for row in rows:
    new_cur.execute("""
        INSERT INTO guild_user_stats (user_id, guild_id, messages_sent, commands_ran, last_announced_level)
        VALUES (%s, %s, %s, %s, 0)
        ON DUPLICATE KEY UPDATE messages_sent = VALUES(messages_sent), commands_ran = VALUES(commands_ran)
    """, (str(row["userid"]), str(row["guildid"]), row["messages_sent"], row["commands_ran"]))
new_conn.commit()
print(f"  → Migrated {len(rows)} guild_user_stats rows")

print("[3] Migrating user_settings → users...")
old_cur.execute("SELECT * FROM user_settings")
rows = old_cur.fetchall()
for row in rows:
    new_cur.execute("""
        INSERT INTO users (id, last_seen)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE last_seen = VALUES(last_seen)
    """, (str(row["userid"]), datetime.utcnow()))
new_conn.commit()
print(f"  → Migrated {len(rows)} users")

print("✅ Migration complete!")

# --- Cleanup ---
old_cur.close()
new_cur.close()
old_conn.close()
new_conn.close()