'use strict'

var beurteileFilterkriterien = require('lists/lib/beurteileFilterkriterien')

module.exports = function(
  beziehungspartner,
  filterwert,
  vergleichsoperator
) {
  // Wenn Feldname = Beziehungspartner, durch die Partner loopen und nur hinzufügen,
  // wessen Name die Bedingung erfüllt
  var bezPartner = []

  if (
    beziehungspartner &&
    beziehungspartner.length
  ) {
    beziehungspartner.forEach(function(partner) {
      var feldwert = partner.Name ? partner.Name.toLowerCase() : null

      if (beurteileFilterkriterien(feldwert, filterwert, vergleichsoperator)) {
        bezPartner.push(partner)
      }
    })
  }
  return bezPartner
}
