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
const addUserRoles = require('./src/addUserRoles.js')
const removeUserRoles = require('./src/removeUserRoles.js')
const server = new Hapi.Server(serverOptionsDevelopment)

server.connection(require('./serverConnection.js'))

server.start((error) => {
  if (error) throw error
  console.log('Server running at:', server.info.uri)
})

server.route(require('./routes/doesuserexistGet.js'))
server.route(require('./routes/userrolesGet.js'))

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
