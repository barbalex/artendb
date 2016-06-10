'use strict'

/**
 * receives options for export
 * returns export data
 */

const PouchDB = require('pouchdb')
const couchUrl = require('./getCouchUrl.js')

module.exports = (request, callback) => {
  const {
    exportOptions,
    onlyObjectsWithCollectionData,
    includeDataFromSynonyms,
    oneRowPerRelation,
    combineTaxonomies
  } = request.params
  const dbUrl = `${couchUrl()}/artendb`
  // connect do users db
  new PouchDB(dbUrl)
    // get all objects
    .then((db) => db.allDocs({ include_docs: true }))
    .then((result) => {
      const objects = result.rows.map((row) => row.doc)
    })
    // return roles to caller
    .then((doc) => callback(null, doc.roles))
    // inform caller of error
    .catch((error) => callback(error, null))
}
