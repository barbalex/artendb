'use strict'

const removeUserRoles = require('../src/removeUserRoles.js')

module.exports = {
  method: 'POST',
  path: '/removeuserroles/user/{username}/roles/{roles}',
  handler: removeUserRoles
}
