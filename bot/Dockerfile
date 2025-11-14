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

FROM node:20 AS build
WORKDIR /app
COPY bot/package*.json ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm \
    npm install
COPY bot .

# Something very weird is happening here... We have two tsconfig.json files.
# We need to modify it so that tsconfig.json extends tsconfig.base.json, instead of ../tsconfig.json
COPY bot/tsconfig.json ./tsconfig.json
COPY tsconfig.json ./tsconfig.base.json
RUN sed -i 's|"extends": *"[^"]*"|"extends": "./tsconfig.base.json"|' tsconfig.json
RUN npm run build

# RUN find . -path '*/node_modules' -prune -o -name 'client.d.ts' -exec dirname {} \; && sleep 70
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ARG VERSION
ENV VERSION=$VERSION
COPY bot/assets ./assets
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev
COPY --from=build /app/dist ./dist

# Metrics HTTP server
EXPOSE 9100


CMD ["node", "--enable-source-maps", "dist/main.js"]
