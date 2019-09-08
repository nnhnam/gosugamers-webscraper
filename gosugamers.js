// Web Scraper for gosugamer.net

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const urlGosugamers = 'https://www.gosugamers.net';

let browser;

const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
];

const skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
];

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const load = async function() {
    browser = await puppeteer.launch({ args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
    ] });
};

const close = async function() {
    await browser.close();
};

// Return a promise containing ongoing and upcoming matches from Gosugamers
const getScheduleURLs = async function({game = '', page = 1}) {
    if (game !== undefined) game += '/';
    const matches = [];
    if (isNaN(page)) throw('invalid page number');
    const tab = await browser.newPage();
    await tab.goto(`${urlGosugamers}/${game}matches?maxResults=18&page=${page}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
    });
    await tab.setRequestInterception(true);
    tab.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (
            blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        ) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    let html = await tab.content();
    let $ = cheerio.load(html);
    if ($('.cf-browser-verification')[0]) {
        await timeout(10000);
        html = await tab.content();
        $ = cheerio.load(html);
    }
    await tab.goto('about:blank');
    await tab.close();
    // Get ongoing
    let len = $('div.cell.match-list > div > div.cell > a > div.live').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.match-list > div > div.cell > a > div.live')[i].parent.attribs.href,
            team1: $('div.cell.match-list > div > div.cell > a > div.live > div > div > div > span.team-1 > span')[i].next.data.trim(),
            team2: $('div.cell.match-list > div > div.cell > a > div.live > div > div > div > span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.match-list > div > div.cell > a > div.live > div > div > div.cell.match-tournament')[i].children[0].data.trim(),
            state: 'live',
        });
    }
    // Get upcoming
    len = $('div.cell.match-list > div > div.cell > a > div.upcoming').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.match-list > div > div.cell > a > div.upcoming')[i].parent.attribs.href,
            time: $('div.cell.small-3.medium-3.match-status > span > time')[i].attribs.datetime,
            team1: $('div.cell.match-list > div > div.cell > a > div.upcoming > div > div > div > span.team-1 > span')[i].next.data.trim(),
            team2: $('div.cell.match-list > div > div.cell > a > div.upcoming > div > div > div > span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.match-list > div > div.cell > a > div.upcoming > div > div > div.cell.match-tournament')[i].children[0].data.trim(),
            state: 'upcoming',
        });
    }
    return matches;
};

// Return a promise containing match results from Gosugamers
const getResultsURLs = async function({game = '', page = 1}) {
    if (game !== undefined) game += '/';
    const matches = [];
    if (isNaN(page)) throw('invalid page number');
    const tab = await browser.newPage();
    await tab.goto(`${urlGosugamers}/${game}matches/results?maxResults=18&page=${page}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
    });
    await tab.setRequestInterception(true);
    tab.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (
            blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        ) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    let html = await tab.content();
    let $ = cheerio.load(html);
    if ($('.cf-browser-verification')[0]) {
        await timeout(10000);
        html = await tab.content();
        $ = cheerio.load(html);
    }
    await tab.goto('about:blank');
    await tab.close();
    let len = $('div.cell.match-list > div.grid-x > div').length;
    let date = '';
    const dateArray = [];
    for (let i = 0; i < len; ++i) {
        if ($('div.cell.match-list > div.grid-x > div')[i].attribs.class === 'match-date cell') {
            date = $('div.cell.match-list > div.grid-x > div')[i].children[0].data.trim();
        }
        else if ($('div.cell.match-list > div.grid-x > div')[i].attribs.class === 'cell') {
            dateArray.push(date);
        }
    }

    len = $('div.cell.match-list > div > div.cell > a').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.match-list > div > div.cell > a')[i].attribs.href,
            team1: $('span.team-1 > span')[i].next.data.trim(),
            team2: $('span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.match-tournament')[i].children[0].data.trim(),
            team1_score: $('div.cell.small-3.medium-3.match-score')[i].children[1].children[0].data.trim(),
            team2_score: $('div.cell.small-3.medium-3.match-score')[i].children[5].children[0].data.trim(),
            time: dateArray[i],
            state: 'finished',
        });
    }
    return matches;
};

// Return a promise containing more detailed information about a match from its href
const getResult = async function(href = '') {
    const tab = await browser.newPage();
    await tab.goto(`${urlGosugamers}${href}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
    });
    await tab.setRequestInterception(true);
    tab.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (
            blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        ) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    let html = await tab.content();
    let $ = cheerio.load(html);
    if ($('.cf-browser-verification')[0]) {
        await timeout(10000);
        html = await tab.content();
        $ = cheerio.load(html);
    }
    await tab.goto('about:blank');
    await tab.close();
    let state = '';
    if ($('div.cell.match.finished')[0]) state = 'finished';
    else if ($('div.cell.match.live')[0]) state = 'live';
    else if ($('div.cell.match.upcoming')[0]) state = 'upcoming';
    else if ($('div.cell.match.canceled')[0]) state = 'canceled';
    else throw('invalid href');
    const result = {
        team1: $('div.small-7:nth-child(1) > h2:nth-child(2) > a:nth-child(1)')[0].children[0].data,
        team2: $('div.small-7:nth-child(2) > h2:nth-child(2) > a:nth-child(1)')[0].children[0].data,
        time: $('div > div.details.cell.large-3.large-order-2 > small')[0].children[0].data.trim(),
        tournament: $('.match-background > div:nth-child(1) > div:nth-child(2) > h1:nth-child(1) > a:nth-child(1)')[0].children[0].data,
        format: $('.best-of')[0].children[0].data.trim(),
        state: state,
    };
    if (state === 'finished') {
        result.team1_score = $('div > div.details.cell.large-3.large-order-2 > div.score')[0].children[1].children[0].data;
        result.team2_score = $('div > div.details.cell.large-3.large-order-2 > div.score')[0].children[3].children[0].data;
    }
    return result;
};

module.exports = { load, close, getScheduleURLs, getResultsURLs, getResult };