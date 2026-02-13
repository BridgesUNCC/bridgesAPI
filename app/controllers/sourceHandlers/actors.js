var mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    request = require('request');
keys = require('../../../config/keys.json'),
api_key = keys.actors.apikey,
params = {},

configuration = {
    host: 'http://private-d9b16-themoviedb.apiary.io'
}

/**
 * Constructs the API endpoint to search for an actor's ID by their name.
 * @param {string} name - The name of the actor to search for.
 */
function searchIDbyName(name) {
    //one search name for id
    configuration.path = "/3/search/person?query=" + name + "&api_key=" + api_key
}

/**
 * Constructs the API endpoint to fetch movies associated with an actor's ID.
 * @param {string} id - The ID of the actor.
 */
function searchActorsById(id) {
    //search id for movies
    configuration.path = "/3/person/" + id + "/movie_credits?api_key=" + api_key
}

/**
 * Checks if the API keys for actor searches are properly configured.
 * @returns {boolean} - Returns true if configured, otherwise false.
 */
exports.configured = function() {
    if (keys.actors.configured == 1) return true
    else return false
}

/**
 * Checks if movie data is available in cache.
 * @param {object} acct - The account object that holds cached streams.
 * @param {array} args - The arguments array, where the first argument is the movie name.
 * @returns {object|null} - Returns the cached data if available, otherwise null.
 */
exports.checkCache = function(acct, args) {
    //no way to access cache
    if (!acct.streams) return null
    if (!args) return null
    if (args[0]) params.movie = args[0]
    var dt = new Date();
    dt.setMinutes(dt.getMinutes() - 1500);
    for (var index in acct.streams) {
        var at = acct.streams[index]
        if (at.screen_name == params.movie && at.dateRequested >= dt) {
            return at
        }
    }
    return null
}

/**
 * Retrieves a public account feed for fetching actor data.
 * @param {string} domain - The domain name of the provider.
 * @param {function} cb - The callback function to return the retrieved account.
 */
exports.getPublicFeeds = function(domain, cb) {
    Account
        .findOne({
            email: "public",
            domainProvider: domain
        })
        .exec(function(err, acct) {
            if (acct) return cb(acct)
            //caution what if this account becomes invalidated?
            acct = new Account();
            acct.email = "public"
            acct.domainProvider = "actors"
            acct.tokens.tokenSecret = api_key

            return cb(acct)
        })
}

/**
 * Initializes the actor search process by querying for an actor's name
 * and retrieving their movie credits.
 * @param {object} account - The account object used for the search.
 * @param {array} args - The arguments array, where the first argument is the actor's name.
 * @param {object} resp - The response object used to return results.
 */
exports.init = function(account, args, resp) {

    acct = account
    res = resp
    if (!args[0]) return res.json({
        "error": "a movie must be provided for searching"
    })
    params.actor = args[0]
    console.log(params.actor)

    var host = configuration.host
    searchIDbyName(params.actor)
    request(host + configuration.path, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            actorResponse = JSON.parse(body)
            if (actorResponse.total_results == 0) return res.json(
                503, {
                    "error": "actor was not found"
                })
            console.log(actorResponse)
            searchActorsById(actorResponse.results[0].id)
            request(host + configuration.path, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    updateActors(null, JSON.parse(body).cast)
                }
            })
        }
    })
}

/**
 * Updates the cached actor-movie data and returns the response.
 * @param {object} err - Error object (if any occurred during the update process).
 * @param {array} corpus - The movie data retrieved from the API.
 */
function updateActors(err, corpus) {

    if (err) next(err)

    console.log("added " + params.movie +
        " to the cache on " + Date())

    res.json(corpus)

    var updateDate = {
        'screen_name': params.movie,
        'count': 1,
        'content': JSON.stringify(corpus),
        'dateRequested': Date.now(),
        'maxid': 0,
        'mode': 0
    }

    /**
     * Replaces or updates cached data in the account's streams.
     * @param {object} acct - The account object storing the cache.
     * @param {string} sn - The screen name of the movie.
     * @param {object} data - The updated data to be stored.
     * @returns {object} - The updated account object.
     */
    replaceCache = function(acct, sn, data) {

        for (a in acct.streams) {
            if (acct.streams[a].screen_name == sn) {
                acct.streams.splice(a)
                acct.streams.push(data)
                return acct
            }
        }
        acct.streams.push(data)
        return acct
    }
    acct = replaceCache(acct, params.movie, updateDate)
    acct.save(function(err) {
        if (err) console.log(err)
        return true;
    })
}
