---
layout: post
title: The ultimate streaming platform DIY
description: an homemade streaming platform, for educational purpose only
summary: Using Plex, Radarr, Sonarr, Prowlarr, Overseerr and Transmission we can build our all-in-one straming services for free.
tags: DIY
published: false
---
## Is Netflix worth?
This question wondered in my mind in the last months.

A lot of streaming services were born lately and this made difficult to get everything 
we want without paying at least 5 different subscriptions. 

## The researches 

### Plex
So I just *DuckDuckgo*ed, and my first result was [Plex](https://www.plex.tv/), I have
heard of it in the past, but never understand it deeply.
Turns out that it transform yuor local Movies and Shows in a self-hostable streaming service,
that you can access from anywhere. 

Thus, it's a [Netflix](https://www.netflix.com/) but with your contents.

### Sonarr, Radarr and Prowlarr

A lot of people online, mentioned other services alongside Plex, and those let me go
down the rabbit hole:

- [Sonarr](https://sonarr.tv) is a PVR (Personalized Video Recorder) for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new episodes of your favorite shows and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available. 

- [Radarr](https://radarr.video/) is a movie collection manager for Usenet and BitTorrent users. Same feature as Sonarr. 

- [Prowlarr](https://prowlarr.com/) is an indexer manager/proxy and integrate with other *arr* apps. Prowlarr supports management of both Torrent Trackers and Usenet Indexers. 

So this "arr"s ecosystem let us manage and find all we want when we want but not actually get 
the content. For that we need a Torrent client to interface these apps.

### Transmission

The simplest torrent client I found was [Transmission](https://transmissionbt.com/).
It's easy to setup and to let it talk to others apps like those mentioned before.

### Overseerr

A final touch will be merging **Radarr** and **Sonarr** together in a better UI/UX experience.
And this is called [Overseerr](https://overseerr.dev).

## The result

Now that we now what services does what, we can connect everything up and start **our Netflix**.
I drew this little scheme to help you get everything right:

![schema1](/assets/img/stack1.png)
*I tried my best at drawing all this :')*

I tested this infrastructure easly on a [Raspberry Pi 4](https://www.raspberrypi.org/) and it went
all flawless.
I decided to use docker-compose to easly manage every service. [Here](https://gist.github.com/P0WEX/c4db33f3f7fbf710fa256075e410eedf) you can find the docker-compose.yml file, if you are curious.

**DISCLAIMER**\
I showed you that there are some alternatives to all the paid streaming services there are out there, and get your own for free, 
but it goes without saying that this above it's for **educational purpose only**.
 




