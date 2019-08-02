// Web Scraper for gosugamer.net

const rp = require('request-promise');
const cheerio = require('cheerio');
const urlSchedule = 'https://www.gosugamers.net/dota2/matches?maxResults=18&page=';
const urlResults = 'https://www.gosugamers.net/dota2/matches/results?maxResults=18&page=';

// Return a promise containing ongoing and upcoming matches from Gosugamers
const getScheduleURLs = async function(page = 1) {
    const matches = [];
    if (isNaN(page)) throw('invalid page number');
    const html = await rp(`${urlSchedule}${page}`);
    const $ = cheerio.load(html);
    // Get ongoing
    let len = $('div.cell.matches-list > div > div.cell > a > div.live').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.matches-list > div > div.cell > a > div.live')[i].parent.attribs.href,
            team1: $('div.cell.matches-list > div > div.cell > a > div.live > div > div > div > span.team-1 > span')[i].next.data.trim(),
            team2: $('div.cell.matches-list > div > div.cell > a > div.live > div > div > div > span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.matches-list > div > div.cell > a > div.live > div > div > div.cell.match-tournament')[i].children[0].data.trim(),
            state: 'live',
        });
    }
    // Get upcoming
    len = $('div.cell.matches-list > div > div.cell > a > div.upcoming').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.matches-list > div > div.cell > a > div.upcoming')[i].parent.attribs.href,
            time: $('div.cell.small-3.medium-3.match-status > span > time')[i].attribs.datetime,
            team1: $('div.cell.matches-list > div > div.cell > a > div.upcoming > div > div > div > span.team-1 > span')[i].next.data.trim(),
            team2: $('div.cell.matches-list > div > div.cell > a > div.upcoming > div > div > div > span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.matches-list > div > div.cell > a > div.upcoming > div > div > div.cell.match-tournament')[i].children[0].data.trim(),
            state: 'upcoming',
        });
    }
    return matches;
};

// Return a promise containing matches' results from Gosugamers
const getResultsURLs = async function(page = 1) {
    const matches = [];
    if (isNaN(page)) throw('invalid page number');
    const html = await rp(`${urlResults}${page}`);
    const $ = cheerio.load(html);
    const len = $('div.cell.matches-list > div > div.cell > a').length;
    for (let i = 0; i < len; ++i) {
        matches.push({
            href: $('div.cell.matches-list > div > div.cell > a')[i].attribs.href,
            team1: $('span.team-1 > span')[i].next.data.trim(),
            team2: $('span.team-2 > span')[i].next.data.trim(),
            tournament: $('div.cell.match-tournament')[i].children[0].data.trim(),
            team1_win: $('div.cell.small-3.medium-3.match-score')[i].children[1].children[0].data.trim(),
            team2_win: $('div.cell.small-3.medium-3.match-score')[i].children[5].children[0].data.trim(),
            state : 'finished',
        });
    }
    return matches;
};

// Return a promise containing more detailed information about a match from its href
const getResult = async function(href) {
    const html = await rp(`https://www.gosugamers.net${href}`);
    const $ = cheerio.load(html);
    let state = '';
    if ($('div.cell.match.finished')[0]) state = 'finished';
    else if ($('div.cell.match.live')[0]) state = 'live';
    else if ($('div.cell.match.upcoming')[0]) state = 'upcoming';
    const result = {
        team1: $('div.small-7:nth-child(1) > h2:nth-child(2) > a:nth-child(1)')[0].children[0].data,
        team2: $('div.small-7:nth-child(2) > h2:nth-child(2) > a:nth-child(1)')[0].children[0].data,
        time: $('div > div.details.cell.large-3.large-order-2 > small')[0].children[0].data.trim(),
        tournament: $('.match-background > div:nth-child(1) > div:nth-child(2) > h1:nth-child(1) > a:nth-child(1)')[0].children[0].data,
        format: $('.best-of')[0].children[0].data.trim(),
        state: state,
    };
    if (state === 'finished') {
        result.team1_win = $('div > div.details.cell.large-3.large-order-2 > div.score')[0].children[1].children[0].data;
        result.team2_win = $('div > div.details.cell.large-3.large-order-2 > div.score')[0].children[3].children[0].data;
    }
    return result;
};

module.exports = { getScheduleURLs, getResultsURLs, getResult };