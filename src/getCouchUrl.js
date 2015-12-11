'use strict'

const couchPass = require('../couchPass.json')
const user = couchPass.user
const pass = couchPass.pass

module.exports = () => `http://${user}:${pass}@localhost:5984`
