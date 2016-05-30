'use strict'

/**
 * receives username
 * returns true if user exists, otherwise false
 */

const PouchDB = require('pouchdb')
const couchUrl = require('./getCouchUrl.js')

module.exports = (request, callback) => {
  const username = request.params.username
  const usersDbUrl = `${couchUrl()}/_users`
  // connect do users db
  new PouchDB(usersDbUrl)
    // get user
    .then((usersDb) => {
      const userId = `org.couchdb.user:${username}`
      return usersDb.get(userId)
    })
    // return true if doc exists, otherwise false
    .then(() => callback(null, true))
    // inform caller of error
    .catch((error) => {
      if (error.status === 404) {
        return callback(null, false)
      }
      callback(error.message, false)
    })
}
