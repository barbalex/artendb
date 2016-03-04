'use strict'

const addUserRoles = require('../src/addUserRoles.js')

module.exports = {
  method: 'POST',
  path: '/adduserroles/user/{username}/roles/{roles}',
  handler: addUserRoles
}
