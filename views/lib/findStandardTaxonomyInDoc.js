'use strict'

module.exports = function (doc) {
  var standardtaxonomie = null
  doc.Taxonomien.forEach(function (taxonomy) {
    if (taxonomy.Standardtaxonomie) standardtaxonomie = taxonomy
  })
  return standardtaxonomie
}
