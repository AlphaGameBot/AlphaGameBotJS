---
title: "How I Turned AlphaGameBot into a Monorepo"
date: 2025-11-14
category: "development"
---

Howdy!

Say that you had a problem where you have two projects, that both needed to access the same folder, and have both read and write access to it.  What would you do?

This is the exact problem I faced just yesterday, when I was rewriting the AlphaGameBot Website in NextJS, and both repositories needed to have the same `prisma` folder.  For context, [Prisma](https://www.prisma.io) is the database library and ORM I use for AlphaGameBot.  It provides static type declarations for TypeScript, and works with almost any database you throw at it. (MySQL, PostgreSQL, SQLite, etc.)

Prisma will create a `prisma` folder in the root of your project, containing two key items: Your `schema.prisma` file, and your `migrations` directory.  Whenever you edit your `schema.prisma` file, a new migration is created to modify your database structure to be in sync with your schema.

However, there's an issue I faced when I initially had two separate repositories for both the main bot, and the website... *How do I manage this folder?*  Both repositories think that they are the source of truth for the Prisma folder, and they have to be completely in sync in order to function properly.

## Git Submodules
[Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) could have worked in my case--From my (albeit uninformed opinion), they're nested Git repos.  The idea is that the Prisma folder can be it's own repo, and I can include it in both repos as a submodule.  This would be the "easy" approach, but be a pain in the behind, especially when I start wanting to sync configurations like ESLint, my TypeScript config, or anything else!

## What I did during development
It was pretty bad.  I just symlinked the folder from the AlphaGameBot repo to the Website repo, and gitignored the prisma folder.  I was like *"Well, in CI, I'll just clone the main bot repo and copy the prisma folder"* but that is just a bandaid on the problem, and is a real pain in the ass to work with, so that's out of the question.

## The Monorepo
This is... the only real solution.  And it was a PAIN to get working.

`npm` has functionality called `npm workspaces`, where you can basically have a root level `package.json`, that references folders each with their own package.json.  It is really weird and, granted, I was most likely conceptualizing it wrong.

What I did was move all of the actual code and bot project into the `bot` folder, and copied the entire web project (a nextjs project) into the `web` folder. Boom, we now have everything in one repository.

But, as you'd expect, chaos happened because nothing was where it initially expected it to be.  I also wrote two seperate `Dockerfile`s for the two components, so in CI, they can be built and deployed individually.

The Dockerfiles are loaded like this: (from the project root)
```bash
docker build -f bot/Dockerfile .
docker build -f web/Dockerfile .
```

The Dockerfiles know that the code for each component is in it's own folder, so it copies that, builds it, and spits out a container all ready.

Funnily enough, minus a minor syntax error where I forgot to escape a newline, it worked in CI first try! That never happens!
## Some Quirks I found
Something weird is that when a command is run with `npm -w (workspace) run (command)`, it is run with the CWD of whatever workspace you are using, which in hindsight makes sense, but it was giving me a hard time at the time. I find that it is very easy to start fighting `npm` here, and you have to play along or you'll have a hard time.

## What still needs to be done
I still need to setup tests for the website, and also work on maybe having a shared project so both can share code, but that's for another day.  I also need to make my automated testing work with my new monorepo design, because that changes a lot.

I will soon be changing the repo name from [AlphaGameBot/AlphaGameBotJS](https://github.com/AlphaGameBot/AlphaGameBotJS) to [AlphaGameBot/Monorepo](https://github.com/AlphaGameBot/Monorepo), but I think GitHub honors these redirects.

Anyway, that's it for now! 
- Damien