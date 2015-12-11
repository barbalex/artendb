'use strict'

/**
 * receives username and roles
 * removes these roles from the user's existing roles
 */

const PouchDB = require('pouchdb')
const _ = require('lodash')
const couchUrl = require('./getCouchUrl.js')

module.exports = (request, callback) => {
  const username = request.params.username
  // need to parse roles because it is an array
  const roles = JSON.parse(request.params.roles)
  const usersDbUrl = `${couchUrl()}/_users`
  // connect do users db
  let usersDb
  new PouchDB(usersDbUrl)
    // get user
    .then((db) => {
      usersDb = db
      const userId = `org.couchdb.user:${username}`
      return usersDb.get(userId)
    })
    // remove passed roles from the user's existing roles
    .then((doc) => {
      doc.roles = _.without(doc.roles, roles.join(','))
      return usersDb.put(doc)
    })
    // inform caller it is done
    .then((result) => callback(null, result))
    // inform caller of error
    .catch((error) => callback(error, null))
}
