#!/usr/bin/env bash
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

echo "initdb/01-init.sh: Creating MySQL user for mysqld_exporter..."
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<- EOSQL
    CREATE USER '${EXPORTER_DB_USER}'@'%' IDENTIFIED BY '${EXPORTER_DB_PASSWORD}';
    GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO '${EXPORTER_DB_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
echo "initdb/01-init.sh: MySQL user for mysqld_exporter created."