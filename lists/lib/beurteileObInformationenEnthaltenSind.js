/* eslint ecmaVersion:5 */
// der Benutzer will nur Objekte mit Informationen aus den gewählten Eigenschaften- und Beziehungssammlungen erhalten
// also müssen wir durch die Felder loopen und schauen, ob der Datensatz anzuzeigende Felder enthält

'use strict'

var _ = require('lists/lib/lodash')

module.exports = function(objekt, felder) {
  var hinzufuegen = false
  // es reicht, wenn mindestens ein feld mit Werten enthalten ist!
  var mindestensEinFeldHinzufuegen = false
  var dsTyp
  var feldName
  var bsMitName
  var bezMitFeldname
  var dsMitName
  var dsName

  if (
    felder &&
    felder.length > 0
  ) {
    felder.forEach(function(feld) {
      dsTyp = feld.DsTyp
      dsName = feld.DsName
      feldName = feld.Feldname
      if (dsTyp === 'Beziehung') {
        // suche Beziehungssammlung mit dsName
        bsMitName = _.find(objekt.Beziehungssammlungen, function(beziehungssammlung) {
          return beziehungssammlung.Name === dsName
        })
        if (
          bsMitName &&
          bsMitName.Beziehungen &&
          bsMitName.Beziehungen.length > 0
        ) {
          // suche Feld feldName
          bezMitFeldname = _.find(bsMitName.Beziehungen, function(beziehung) {
            return (
              beziehung[feldName] ||
              beziehung[feldName] === 0
            )
          })
          hinzufuegen = !!bezMitFeldname
          if (hinzufuegen) {
            mindestensEinFeldHinzufuegen = true
          }
        }
      } else if (dsTyp === 'Datensammlung') {
        // das ist ein Feld aus einer Datensammlung
        // suche Datensammlung mit Name = dsName
        dsMitName = _.find(objekt.Eigenschaftensammlungen, function(datensammlung) {
          return datensammlung.Name === dsName
        })
        // hinzufuegen, wenn Feld mit feldName existiert und es Daten enthält
        hinzufuegen = (
          dsMitName &&
          dsMitName.Eigenschaften !== undefined &&
          dsMitName.Eigenschaften[feldName] !== undefined
        )
        if (hinzufuegen) {
          mindestensEinFeldHinzufuegen = true
        }
      }
    })
  }
  return mindestensEinFeldHinzufuegen
}
