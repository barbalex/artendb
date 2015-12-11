'use strict'

/**
 * receives username
 * returns roles of the user
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
    // return roles to caller
    .then((doc) => callback(null, doc.roles))
    // inform caller of error
    .catch((error) => callback(error, null))
}
