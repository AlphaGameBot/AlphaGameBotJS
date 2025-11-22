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


export default function NotFound() {
    return (
        <main>
            {/* nice 404 page - funny and engaging */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404 Not Found</h1>
                <p style={{ fontSize: '1.5rem' }}>
                    These are not the droids you're looking for.&nbsp;
                    (╯°□°）╯︵ ┻━┻</p>
                <a href="/" style={{ marginTop: '2rem', padding: '1rem 2rem', backgroundColor: '#0070f3', color: '#fff', borderRadius: '5px', textDecoration: 'none' }}>Go to Home</a>
            </div>
        </main>
    );
}
