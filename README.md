# Gosugamers Webscraper
Webscraper for gosugamers.net.

This webscrapper is unofficial and it might stop working if Gosugamers updates their site.
I will try to keep it up to date.
## Installation
```
git clone https://github.com/nnhnam/gosugamers-webscraper.git
cd gosugamers-webscraper/
npm install
```
*It will take a while to download since it needs Chromium for the Puppeteer version to works.*
## Usage
Don't abuse and send request too fast. Gosugamers might deny your request and block your IP.
```js
const gosugamers = require('./gosugamers'); // Using Puppeteer
const gosugamers_rp = require('./gosugamers-rp'); // Using Request
```
Use Puppeteer if Gosugamers requires Javascript to load their website. Otherwise use Request as it's much lighter and faster.
* `gosugamers.getScheduleURLs({game, page})` Return a promise containing ongoing and upcoming matches parsed from

    `https://www.gosugamers.net/${game}/matches?maxResults=18&page=${page}`

* `gosugamers.getResultsURLs({game, page})` Return a promise containing match results parsed from

    `https://www.gosugamers.net/${game}/matches/results?maxResults=18&page=${page}`

* `gosugamers.getResult(href)` Return a promise containing match information parsed from 

    `https://www.gosugamers.net/_${href}`

Pass **game** as undefined to get result from all games.
Check out https://www.gosugamers.net/ for a list of game strings.

### Example
Puppeteer version
```js
const gosugamers = require('./gosugamers');
const test = async function() {
    await gosugamers.load();
    const sc = await gosugamers.getScheduleURLs({ game: undefined, page: 1 }).catch(console.error);
    console.log(sc); // Array of upcoming and ongoing matches
    const rs = await gosugamers.getResultsURLs({ game: 'dota', page: 2 }).catch(console.error);
    console.log(rs); // Array of match results
    const match = await gosugamers.getResult('/dota2/tournaments/33677-the-international-2019/matches/318842-og-vs-fnatic');
    console.log(match); // Object containing match information
    await gosugamers.close();
}
```
Request version
```js
const gosugamers = require('./gosugamers-rp');
const test = async function() {
    const sc = await gosugamers.getScheduleURLs({ game: 'lol', page: 1 }).catch(console.error);
    console.log(sc); // Array of upcoming and ongoing matches
    const rs = await gosugamers.getResultsURLs({ game: 'counterstrike', page: 3 }).catch(console.error);
    console.log(rs); // Array of match results
    const match = await gosugamers.getResult('/dota2/tournaments/33677-the-international-2019/matches/318842-og-vs-fnatic');
    console.log(match); // Object containing match information
}
```
Gosugamers-rp also has load() and close() which are just placeholder functions and don't do anything.

