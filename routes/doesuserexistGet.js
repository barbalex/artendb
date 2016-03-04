'use strict'

const doesUserExist = require('../src/doesUserExist.js')

module.exports = {
  method: 'GET',
  path: '/doesuserexist/{username}',
  handler: doesUserExist
}
