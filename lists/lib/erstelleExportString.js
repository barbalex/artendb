/* eslint ecmaVersion: 5 */
'use strict'

var _ = require('lists/lib/lodash')

module.exports = function(exportobjekte) {
  var stringTitelzeile = ''
  var stringZeilen = ''
  var stringZeile

  if (
    exportobjekte &&
    exportobjekte.length
  ) {
    exportobjekte.forEach(function(exportobjekt) {
      // aus unerklärlichem Grund blieb stringTitelzeile leer, wenn nur ein Datensatz gefiltert wurde
      // daher bei jedem Datensatz prüfen, ob eine Titelzeile erstellt wurde und wenn nötig ergänzen
      if (
        stringTitelzeile === '' ||
        stringTitelzeile === ','
      ) {
        stringTitelzeile = ''
        // durch Spalten loopen
        _.each(exportobjekt, function(feldwert, feldname) {
          if (stringTitelzeile !== '') {
            stringTitelzeile += ','
          }
          stringTitelzeile += '"' + feldname + '"'
        })
      }

      if (stringZeilen !== '') {
        stringZeilen += '\n'
      }
      stringZeile = ''
      // durch die Felder loopen
      exportobjekt.forEach(function(feldwert) {
        if (stringZeile !== '') {
          stringZeile += ','
        }
        // null-Werte als leere Werte
        if (feldwert === null) {
          stringZeile += ''
        } else if (typeof feldwert === 'number') {
          // Zahlen ohne Anführungs- und Schlusszeichen exportieren
          stringZeile += feldwert
        } else if (typeof feldwert === 'object') {
          // Anführungszeichen sind Feldtrenner und müssen daher ersetzt werden
          stringZeile += '"' + JSON.stringify(feldwert).replace(/"/g, "'") + '"'
        } else {
          stringZeile += '"' + feldwert + '"'
        }
      })
      stringZeilen += stringZeile
    })
  }
  return stringTitelzeile + '\n' + stringZeilen
}
