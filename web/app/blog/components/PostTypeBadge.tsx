// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

export enum PostType {
    Announcement = 'announcement',
    Tutorial = 'tutorial',
    Postmortem = 'postmortem',
    Update = 'update',
    Development = 'development',
}

export default function PostTypeBadge({ type }: { type: PostType }) {
    let badgeText;
    let badgeColor;
    switch (type) {
        case PostType.Announcement:
            badgeText = 'Announcement';
            badgeColor = 'bg-blue-500';
            break;
        case PostType.Tutorial:
            badgeText = 'Tutorial';
            badgeColor = 'bg-green-500';
            break;
        case PostType.Postmortem:
            badgeText = 'Postmortem';
            badgeColor = 'bg-red-400';
            break;
        case PostType.Update:
            badgeText = 'Update';
            badgeColor = 'bg-yellow-500';
            break;
        case PostType.Development:
            badgeText = 'Development';
            badgeColor = 'bg-purple-500';
            break;
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _never: never = type;
            badgeColor = 'bg-gray-500';
            badgeText = 'Unknown';
    }

    return (
        <span className={`badge ${badgeColor}`} title={`Post Type: ${badgeText}`}>
            {badgeText}
        </span>
    );
}