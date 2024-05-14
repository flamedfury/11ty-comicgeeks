"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = exports.fetchSearchResults = exports.fetchWishList = exports.fetchCollection = exports.fetchPulls = exports.fetchReleases = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const constants_1 = require("./constants");
const parsers_1 = __importDefault(require("./parsers"));
const sorts_1 = __importDefault(require("./sorts"));
const util_1 = require("./util");

async function _fetchData(params, parser) {
    try {
        const url = util_1.formatURL(`${constants_1.BASE_URL}/comic/get_comics`, params);
        const response = await node_fetch_1.default(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const responseText = await response.text(); // Get raw text
        let jsonData;
        try {
            jsonData = JSON.parse(responseText); // Parse JSON data
        } catch (jsonError) {
            console.error("Failed to parse JSON:", responseText);
            throw new Error("Failed to parse JSON response");
        }
        
        const { list } = jsonData;
        const $ = cheerio_1.default.load(list);
        const data = $('li').map(parser($)).get();
        return data;
    } catch (error) {
        console.error("Error in _fetchData:", error);
        throw error;
    }
}

async function _fetchComics(params, options, parser = parsers_1.default.Issue) {
    try {
        if (options?.publishers) {
            if (!Array.isArray(options.publishers))
                throw new TypeError('The \'publishers\' option must be an array of publisher names or IDs.');
            params.publisher = util_1.resolvePublishers(options.publishers);
        }
        if (options?.filter) {
            if (!Array.isArray(options.filter))
                throw new TypeError(`The 'filter' option must be an array of FilterTypes.`);
            const types = Object.values(constants_1.FilterTypes);
            for (const type of options.filter) {
                if (!types.includes(type))
                    throw new RangeError(`The 'filter' option must only include FilterTypes. Received ${type}.`);
            }
            params.format = options.filter;
        }
        if (options?.sort && !Object.values(constants_1.SortTypes).includes(options.sort)) {
            throw new RangeError(`The 'sort' option must be one of '${Object.values(constants_1.SortTypes).join('\', \'')}'. Received '${options.sort}'.`);
        }
        const data = await _fetchData(params, parser);
        if (options?.sort) {
            switch (options.sort) {
                case constants_1.SortTypes.MostPulled:
                    return data;
                case constants_1.SortTypes.PickOfTheWeek:
                    return data.sort(sorts_1.default.PotW);
                case constants_1.SortTypes.AlphaAsc:
                    return data.sort(sorts_1.default.Alpha);
                case constants_1.SortTypes.AlphaDesc:
                    return data.sort(sorts_1.default.Alpha).reverse();
                case constants_1.SortTypes.LowPrice:
                    return data.sort(sorts_1.default.Price).reverse();
                case constants_1.SortTypes.HighPrice:
                    return data.sort(sorts_1.default.Price);
                case constants_1.SortTypes.CommunityConsensus:
                    return data.sort(sorts_1.default.Community);
            }
        }
        return data;
    } catch (error) {
        console.error("Error in _fetchComics:", error);
        throw error;
    }
}

async function fetchReleases(date, options) {
    const params = {
        list: 'releases',
        list_option: 'thumbs',
        view: 'list',
        date: util_1.resolveDate(date),
        date_type: 'week'
    };
    return _fetchComics(params, options);
}
exports.fetchReleases = fetchReleases;

async function fetchPulls(userID, date, options) {
    const params = {
        list: 1,
        list_option: 'thumbs',
        view: 'list',
        user_id: userID,
        date: util_1.resolveDate(date),
        date_type: 'week'
    };
    return _fetchComics(params, options);
}
exports.fetchPulls = fetchPulls;

async function fetchCollection(userID, format = constants_1.CollectionTypes.Issue, options) {
    const params = {
        list: 2,
        list_option: format,
        view: format === constants_1.CollectionTypes.Issue ? 'list' : 'thumbs',
        user_id: userID
    };
    return _fetchComics(params, options, format === constants_1.CollectionTypes.Issue ? parsers_1.default.Issue : parsers_1.default.Series);
}
exports.fetchCollection = fetchCollection;

async function fetchWishList(userID, format = constants_1.CollectionTypes.Issue, options) {
    const params = {
        list: 3,
        list_option: format,
        view: format === constants_1.CollectionTypes.Issue ? 'list' : 'thumbs',
        user_id: userID
    };
    return _fetchComics(params, options, format === constants_1.CollectionTypes.Issue ? parsers_1.default.Issue : parsers_1.default.Series);
}
exports.fetchWishList = fetchWishList;

async function fetchSearchResults(query, format = constants_1.CollectionTypes.Issue) {
    const params = {
        list: 'search',
        title: query,
        list_option: format
    };
    return _fetchData(params, parsers_1.default.Series);
}
exports.fetchSearchResults = fetchSearchResults;

async function fetchUser(name) {
    try {
        const url = `${constants_1.BASE_URL}/profile/${name.toLowerCase()}`;
        const response = await node_fetch_1.default(`${url}/pull-list`);
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const responseText = await response.text(); // Get raw text
        const $ = cheerio_1.default.load(responseText);
        const details = $('#comic-list-block').first();
        const avatar = $('.avatar-user.mr-3 a img').attr('src');
        const id = Number(details.attr('data-user'));

        if (isNaN(id) || !details) {
            throw new Error(`User '${name}' not found.`);
        }

        return {
            id,
            name: $('title').text().slice(0, -47),
            url,
            avatar: avatar ?? constants_1.DEFAULT_AVATAR
        };
    } catch (error) {
        console.error("Error in fetchUser:", error);
        throw error;
    }
}
exports.fetchUser = fetchUser;
