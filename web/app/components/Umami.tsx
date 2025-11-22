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

"use client";

import Script from "next/script";

export const UmamiAnalytics = () => {
    // guard for SSR — this component is marked "use client" but be explicit
    if (typeof window === "undefined") return null;

    const src = window.location.hostname.includes("alphagamebot.com")
        ? "https://www.alphagamebot.com/rt/hazel.js"
        : "https://analytics.alphagamebot.com/script.js";

    const host_url = window.location.hostname.includes("alphagamebot.com")
        ? "https://www.alphagamebot.com/"
        : "https://analytics.alphagamebot.com/";

    return (
        <Script
            src={src}
            strategy="afterInteractive"
            defer={true}
            async={true}
            data-website-id="ff1f8a0d-7597-429a-b73f-f5bea5a4d9d3"
            data-host-url={host_url}
        />
    );
};