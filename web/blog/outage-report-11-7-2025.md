---
title: "Outage Report: November 7, 2025"
date: "2025-11-11"
category: "postmortem"
---

For the last weekend, AlphaGameBot was down while I was distracted, competing in [Mountain Hacks 2025](https://mountainhacks.net/).

Here's what happened--And it was a very dumb mistake.

## What Happened

In commit [597e541](https://github.com/AlphaGameBot/AlphaGameBotJS/commit/597e5414d45ddf8e9f3482185c4e6a43200cb227), I added the ability to send error reporting, which re-added something I did in the Python AlphaGameBot, which is to have an assets directory. In this, it contains files that it uses to run, which, in this case, contained an issue template using [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/).

All the code worked in my local dev setup--It can just access the assets folder on my drive. My dev setup only uses Docker to run the infrastructure, but the actual bot while testing is not dockerized at all.

This caused a problem where the code worked--Don't get me wrong--but the `assets` directory was not copied to the Docker container when it was built, causing the bot to crash on startup because it cannot load the `assets/error-report-template.md.njk` file, and the complete application crashed before connecting to Discord. Because of the Docker config, it'll restart, and get caught in a loop.

I only just realized now, that the bot was down when I was checking Grafana, and all the metrics were flatlined, not at 0, but at seemingly whatever they were at when the last successful deployment happened. Seemingly, pushgateway was regurgitating the last metrics received, and Prometheus was scraping that over and over again.

There were `error` logs, which should be sent to ping me on Discord, but because of a misconfiguration, that never happened and I was kept in the dark the whole time. Ideally, the moment an error happens, I would be pinged and receive a notification.

## I'll do better next time

A future change is for AlphaGameBot to expose a HTTP metrics endpoint, `/metrics`, so that it will actually raise issues when it's no longer on, or more realistically, make Pushgateway not cache metrics for more than 1 minute. After 1 minute, if it gets no metrics, it should delete them (We push every 15 seconds)

Anyway, that's it, and I'll go finish implementing all these changes.

- Damien