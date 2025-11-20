---
title: "A Fresh Start for AlphaGameBot"
date: "2025-10-15"
category: "announcement"
---

> *Well, here we are again -- It's always such a pleasure*\
> -- GLaDOS, *"Want You Gone"*

[AlphaGameBot](https://www.alphagamebot.com/) has been my #1 project ever since I started, and I learned so damn much from coding it. Starting in December of 2023, up until now, October of 2025, code has been steadily added to add functionality and maintain the bot.

When I started, I never assumed that this would be a big project. It was just a dumb bot I made for fun in my friend group... Then my friend, CombineSoldier14 ([blog](https://combinesoldier14.github.io)) made his bot, which had 3 main versions: (*UltraBot* with [BDScript](https://wiki.botdesignerdiscord.com/bdscript/introduction.html), and changed to *CombineBot* when it was rewritten in Python with the Pycord library, and then later to Discord.js).

AlphaGameBot started and has always been written with the [Pycord](https://pycord.dev) library. I love Python--It's my language of choice, it's easy to code in (especially on the server), and integrated well with existing libraries and tools that I knew how to use. But recently, the bad choices made a while back are beginning to rear their ugly heads, and I am rapidly approaching the limits of my current codebase and the Pycord library-- Things that will require massive rewrites in the codebase, and, of course, bugs as a result of the rewrite.

In the past, I have been incredibly stubborn when it came to AlphaGameBot inevitably moving away from [Pycord](https://pycord.dev)... Don't get me wrong--I still love Pycord as a library. It is, in my opinion, the single best library for small and bot developers who are starting up... It handles lots of the lower-level stuff for you, so you can focus on your own code, instead of dealing with low-level stuff like with [Discord.js](https://discord.js.org/); However, the layer of abstraction that [Pycord](https://pycord.dev) provides can eventually become a problem, which is how lots of the questionable choices I made with AlphaGameBot came to happen.

## So, what now?

I am going to begin the long process of completely rewriting AlphaGameBot in Node.JS, providing a much better foundation, more low-level control over everything, and a strong type-checking system provided by TypeScript. In fact, in the time since I started this rewrite, I have become a huge fan of TypeScript![^1] The type-checking system is wonderful[^2], the Visual Studio Code integrations are amazing, with the single best autocomplete[^3] experience I've ever had with any language in VSCode. I especially love how you can configure VSCode to automatically handle and delete unused imports from your files, keeping them clean and removing unused imports, and automatically formatting the files on save. There's also ESLint, holding me to a good standard when I write code, and letting me know when I mess up in that regard^[^4].

Another huge change I am going to be making to this version is using the [Prisma ORM](https://www.prisma.io), because in AlphaGameBot, I was basically just handwriting SQL queries--Which caused a lot of problems down the line, because I had no strict schema or migrations--I was quite literally testing on and manually adding tables on the production database by hand. In fact, no wonder lots of the DB problems happened--In hindsight, my setup was crap!

## Docker

I can see that the `alphagamedev/alphagamebot` Docker image has around ~1.7K Docker pulls at the time of writing this... My plan now for the Docker repo is to keep all the (to-be) legacy AlphaGameBot versions (2.7-3.12) in the same repo, and start versioning at 4.0 with this new rewrite. At that time, `alphagamedev/alphagamebot:latest` will start pointing to the new JavaScript version. I already set up `alphagamedev/alphagamebot:py-latest` for the latest Python version[^5]. You're welcome ;)

Basically, I am expecting (subject to change) to have `alphagamedev/alphagamebot:latest` point to the latest JS version, `alphagamedev/alphagamebot:py-latest` be the latest Python version, keep up tags `2.7` through `3.12.11` as normal, and everything past `4.0` will be the new JavaScript version. I'll most likely have a migration guide, or leave it to you to fend for yourself. That's a future-me problem. :)

I do think, though, that I will still be giving help with the legacy version[^6], but will no longer maintain or provide updates. At the time that AlphaGameBot 4.0 is released, I strongly recommend switching to this if you need help.

## New GitHub Repository

The current GitHub repository for the JS rewrite is [AlphaGameBot/AlphaGameBotJS](https://github.com/AlphaGameBot/AlphaGameBotJS), but when it eventually becomes the production AlphaGameBot, it'll be renamed to AlphaGameBot/AlphaGameBot. The old version will be renamed and archived. (and yes GitHub honors redirects so AlphaGameBotJS will then point to the correct repo.)

Also, a new WebUI is coming. Gonna use NextJS, I believe.

## Final Thoughts

Well, we've got a whole lot of work to do. I hope you'll embark on this journey with me on the quest of continuously improving AlphaGameBot. And remember--It's still open-source so feel free to make a PR!

Ciao!

-   Damien Boisvert (AlphaGameDeveloper)

[^1]: Of course, Node.JS is a mistake and *never* should have happened--JavaScript should have stayed as a lightweight scripting language for the web... But... now what I've actually given Node a fair shot--It's much better than I thought it would be. Post for another day.

[^2]: Even though it can, of course, be a bit draconian at times. Not denying that.

[^3]: Or Intellisense, if you prefer calling it that. (Yes, it is the correct name)

[^4]: PS- I highly recommend setting `no-console` in ESLint; Use a logger like [Winston](https://github.com/winstonjs/winston) instead. Felt very familiar to me, coming from the Python standard [logging](https://docs.python.org/3/library/logging.html) module.

[^5]: At the time of writing this, `3.12.11`

[^6]: Subject to change lol
