'use strict'

module.exports = function(doc) {
  var standardtaxonomie = null
  if (doc.Taxonomien) {
    doc.Taxonomien.forEach(function(taxonomy) {
      if (taxonomy.Standardtaxonomie) {
        standardtaxonomie = taxonomy
      }
    })
  }
  return standardtaxonomie
}
