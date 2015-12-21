/**
 * Right now couchdb serv's it's own lists so hapi would not be needed for that yet
 * later hapi shall take over these lists
 * Now hapi is needed to give a user new roles when an organization sets
 * users as esWriters, lrWriters and orgAdmins
 */

'use strict'

// only used sometimes in development:
// plase this variable in: new Hapi.Server(serverOptionsDevelopment)

const serverOptionsDevelopment = {
  debug: {
    log: ['error'],
    request: ['error']
  }
}

const Hapi = require('hapi')
const doesUserExist = require('./src/doesUserExist.js')
const getUserRoles = require('./src/getUserRoles.js')
const addUserRoles = require('./src/addUserRoles.js')
const removeUserRoles = require('./src/removeUserRoles.js')
const server = new Hapi.Server(serverOptionsDevelopment)

server.connection({
  host: '0.0.0.0',
  port: 8000,
  routes: {
    cors: true
  }
})

server.start((error) => {
  if (error) throw error
  console.log('Server running at:', server.info.uri)
})

server.route({
  method: 'GET',
  path: '/doesuserexist/{username}',
  handler: doesUserExist
})

server.route({
  method: 'GET',
  path: '/userroles/{username}',
  handler: getUserRoles
})

server.route({
  method: 'POST',
  path: '/adduserroles/user/{username}/roles/{roles}',
  handler: addUserRoles
})

server.route({
  method: 'POST',
  path: '/removeuserroles/user/{username}/roles/{roles}',
  handler: removeUserRoles
})
