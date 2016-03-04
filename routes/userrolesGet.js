'use strict'

const getUserRoles = require('../src/getUserRoles.js')

module.exports = {
  method: 'GET',
  path: '/userroles/{username}',
  handler: getUserRoles
}
