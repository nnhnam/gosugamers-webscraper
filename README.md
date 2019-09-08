# gosugamers webscraper
Webscraper for gosugamers.net
Currently only dota matches are available
## Installation
```bash
git clone https://github.com/nnhnam/gosugamers-webscraper.git
cd gosugamers-webscraper/
npm install
```

## Usage
Don't abuse and send request too fast. Gosugamers might block your IP.
```js
const gosugamers = require('./gosugamers'); // Using puppeteer
const gosugamersrp = require('./gosugamers-rp'); // Using request-promise
```
Use puppeteer if Gosugamers requires Javascript to load their website
Otherwise use request-promise, it's much lighter and faster
* `gosugamers.getScheduleURLs(page)` Parse all matches from `https://www.gosugamers.net/dota2/matches?maxResults=18&page=${page}`, return a promise containing ongoing and upcoming matches.
* `gosugamers.getResultsURLs(page)` Parse all matches from `https://www.gosugamers.net/dota2/matches/results?maxResults=18&page=${page}`, return a promise containing match results.
* `gosugamers.getResult(href)` Parse a match from `https://www.gosugamers.net/${href}`, return a promise containing match information.
### Exemple
```js
const test = async function() {
    gosugamers.load();
    const sc = await gosugamers.getScheduleURLs(1).catch(console.error);
    console.log(sc); // Array of upcoming and ongoing matches
    const rs = await gosugamers.getResultsURLs(1).catch(console.error);
    console.log(rs); // Array of match results
    const match = await gosugamers.getResult('/dota2/tournaments/33677-the-international-2019/matches/318842-og-vs-fnatic');
    console.log(match); // Object containing match information
    gosugamers.close();
}
```
To use request-promise, just replace gosugamers with gosugamersrp. However the load and close functions of gosugamersrp don't do anything. They are just placeholders.

