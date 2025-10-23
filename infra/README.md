<!--
 This file is a part of AlphaGameBot.
 
     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
 
     AlphaGameBot is free software: you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
 
     AlphaGameBot is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.
 
     You should have received a copy of the GNU General Public License
     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.
-->

# Deployment Infrastructure for AlphaGameBot

Note, this 'guide' *(if you can even call it that)* is primarily for my own reference.  It will most likely be incomplete and poorly written.  But hey, at least it's something.

## Prerequisites
- Docker and Docker Compose installed on your server.
- Basic knowledge of Docker and Docker Compose.
- A server or VPS to host the services.

## Services Overview
This setup includes the following services:
- **MySQL**: Database for storing bot data.
- **Prometheus**: Metrics collection and monitoring.
    - **mysqld_exporter**: Exports MySQL metrics for Prometheus.
- **Loki**: Log aggregation system.

### Grafana (Optional)
- Grafana can be added for visualizing metrics and logs collected by Prometheus and Loki.
- Note: Grafana setup is not included in this guide, nor is it part of the provided `docker-compose.yml` file. (Loki and Prometheus are mapped to the host machine so you can easily connect Grafana to them if you choose to set it up separately.)
    - Grafana is highly recommended - it's so awesome!

## Setup
Copy the `infra` directory to your server.  First, you should copy the `.env.example` file to `.env` and edit the environment variables as needed.

```bash
cp .env.example .env
```

There are a few things that you have to configure in the `.env` file:

1. First, set the `MYSQL_ROOT_PASSWORD` and `MYSQL_USER_PASSWORD` to secure passwords.
    1. I recommend setting `MYSQL_ROOT_PASSWORD` to something you can remember, as you'll need it to access the database for maintenance.
    2. You won't need to remember `MYSQL_USER_PASSWORD` unless you plan on accessing the database using the `alphagamebot` user (which is only used by the bot itself).
    3. I strongly recommend the [Random.org Password Generator](https://www.random.org/passwords/?num=5&len=16&format=html&rnd=new) for generating secure passwords.
2. Modify the `EXPORTER_DB_USER` and `EXPORTER_DB_PASSWORD` if you want to change the default MySQL user for `mysqld_exporter`.
    1. Make sure to use a secure password for `EXPORTER_DB_PASSWORD`.
3. Next, you have to edit the `mysqlexporter.cnf` file to set the MySQL credentials for `mysqld_exporter`.
    1. Set the `user` and `password` fields to match the `MYSQL_USER` and `MYSQL_USER_PASSWORD` environment variables in the `.env` file.

*TODO: finish this. You get the idea though.  Or make a PR. that'd be nice :)*