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
COPY . .
RUN --mount=type=cache,target=/root/.npm \
    npm ci
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY --from=build /app/dist ./dist
RUN npx prisma generate
CMD ["node", "dist/main.js"]
