/* eslint ecmaVersion: 5 */
'use strict'

var _ = require('lists/lib/lodash')
var filtereBeziehungspartner = require('lists/lib/filtereBeziehungspartner')
var beurteileFilterkriterien = require('lists/lib/beurteileFilterkriterien')
var convertToCorrectType = require('lists/lib/convertToCorrectType')
var fuegeObligatorischeFelderFuerAltEin = require('lists/lib/fuegeObligatorischeFelderFuerAltEin')
var findStandardTaxonomyInDoc = require('lists/lib/findStandardTaxonomyInDoc')

// baut die Export-Objekte auf für alle export-lists
// benötigt Objekt und felder
// retourniert schonKopiert und exportObjekt
// exportFuer: ermöglicht anpassungen für spezielle Exporte, z.b. für das Artenlistentool
module.exports = function(
  objekt,
  felder,
  bezInZeilen,
  fasseTaxonomienZusammen,
  filterkriterien,
  exportObjekte,
  exportFuer
) {
  var exportObjekt = {}
  var schonKopiert = false
  var standardtaxonomie = findStandardTaxonomyInDoc(objekt)

  // es müssen Felder übergeben worden sein
  // wenn nicht, aufhören
  if (
    !felder ||
    felder.length === 0
  ) {
    return {}
  }

  // wenn der Export für das Artenlistentool erstellt wird:
  // Obligatorische Felder einfügen
  if (
    exportFuer &&
    exportFuer === 'alt'
  ) {
    // Für das ALT obligatorische Felder hinzufügen
    exportObjekt = fuegeObligatorischeFelderFuerAltEin(objekt, exportObjekt)
    // wenn etwas wesentliches versagt, kommt leeres Objekt zurück
    if (_.keys(exportObjekt).length === 0) return {}

    // Für das ALT obligatorische Felder aus felder entfernen, sonst gibt es Probleme und es wäre unschön
    felder = _.reject(felder, function(feld) {
      return ['Artwert'].indexOf(feld.Feldname) >= 0
    })
  }

  // Neues Objekt aufbauen, das nur die gewünschten Felder enthält
  _.each(objekt, function(feldwert, feldname) {
    if (
      typeof feldwert !== 'object' &&
      feldname !== '_rev'
    ) {
      felder.forEach(function(feld) {
        if (
          feld.DsName === 'Objekt' &&
          feld.Feldname === feldname
        ) {
          exportObjekt[feldname] = feldwert
        }
        if (
          feld.DsName === 'Objekt' &&
          feld.Feldname === 'GUID' &&
          feldname === '_id'
        ) {
          exportObjekt.GUID = feldwert
        }
      })
    }
  })

  felder.forEach(function(feld) {
    var exportFeldname = feld.DsName + ': ' + feld.Feldname
    var feldwert
    var gesuchteDs
    var bsMitNamen
    var exportBeziehungen

    // Taxonomie: Felder übernehmen
    if (feld.DsTyp === 'Taxonomie') {
      // Leerwert setzen. Wird überschrieben, falls danach ein Wert gefunden wird
      if (fasseTaxonomienZusammen) {
        exportObjekt['Taxonomie(n): ' + feld.Feldname] = ''
      } else {
        exportObjekt[exportFeldname] = ''
      }
      // wenn im objekt das zu exportierende Feld vorkommt, den Wert übernehmen
      if (_.get(standardtaxonomie, ['Eigenschaften', feld.Feldname]) !== undefined) {
        if (fasseTaxonomienZusammen) {
          exportObjekt['Taxonomie(n): ' + feld.Feldname] = standardtaxonomie.Eigenschaften[feld.Feldname]
        } else {
          exportObjekt[exportFeldname] = standardtaxonomie.Eigenschaften[feld.Feldname]
        }
      }
    }

    // Eigenschaftensammlungen: Felder übernehmen
    if (feld.DsTyp === 'Datensammlung') {
      // das leere feld setzen. Wird überschrieben, falls danach ein Wert gefunden wird
      exportObjekt[exportFeldname] = ''
      if (
        objekt.Eigenschaftensammlungen &&
        objekt.Eigenschaftensammlungen.length > 0
      ) {
        // Enthält das objekt diese Datensammlung?
        gesuchteDs = _.find(objekt.Eigenschaftensammlungen, function(datensammlung) {
          return _.get(datensammlung, 'Name') === feld.DsName
        })
        if (gesuchteDs) {
          // ja. Wenn die Datensammlung das Feld enthält > exportieren
          if (
            gesuchteDs.Eigenschaften &&
            gesuchteDs.Eigenschaften[feld.Feldname] !== undefined
          ) {
            exportObjekt[exportFeldname] = gesuchteDs.Eigenschaften[feld.Feldname]
          }
        }
      }
    }

    if (feld.DsTyp === 'Beziehung') {
      // das leere feld setzen. Wird überschrieben, falls danach ein Wert gefunden wird
      exportObjekt[exportFeldname] = ''

      // wurde schon ein zusätzliches Feld geschaffen? wenn ja: hinzufügen
      if (feld.Feldname === 'Beziehungspartner') {
        // noch ein Feld hinzufügen
        exportObjekt[feld.DsName + ': Beziehungspartner GUID(s)'] = ''
      }

      if (
        objekt.Beziehungssammlungen &&
        objekt.Beziehungssammlungen.length > 0
      ) {
        // suchen, ob das objekt diese Beziehungssammlungen hat
        // suche im objekt die Beziehungssammlung mit Name = feld.DsName
        bsMitNamen = _.find(objekt.Beziehungssammlungen, function(beziehungssammlung) {
          return _.get(beziehungssammlung, 'Name') === feld.DsName
        })
        if (
          bsMitNamen &&
          bsMitNamen.Beziehungen &&
          bsMitNamen.Beziehungen.length > 0
        ) {
          // Beziehungen, die exportiert werden sollen, in der Variablen 'exportBeziehungen' sammeln
          // durch alle Beziehungen loopen und nur diejenigen anfügen, welche die Bedingungen erfüllen
          exportBeziehungen = []
          bsMitNamen.Beziehungen.forEach(function(beziehung) {
            if (beziehung[feld.Feldname] !== undefined) {
              // das gesuchte Feld kommt in dieser Beziehung vor
              feldwert = convertToCorrectType(beziehung[feld.Feldname])
              if (
                filterkriterien &&
                filterkriterien.length
              ) {
                filterkriterien.forEach(function(filterkriterium) {
                  var dsTyp = filterkriterium.DsTyp
                  var dsName = filterkriterium.DsName
                  var feldname = filterkriterium.Feldname
                  var filterwert = convertToCorrectType(filterkriterium.Filterwert)
                  var vergleichsoperator = filterkriterium.Vergleichsoperator
                  var beziehungspartner

                  if (
                    dsTyp === 'Beziehung' &&
                    dsName === feld.DsName &&
                    feldname === feld.Feldname
                  ) {
                    // Beziehungspartner sind Objekte und müssen separat gefiltert werden
                    if (feldname === 'Beziehungspartner') {
                      beziehungspartner = filtereBeziehungspartner(
                        feldwert,
                        filterwert,
                        vergleichsoperator
                      )
                      if (beziehungspartner.length > 0) {
                        beziehung.Beziehungspartner = beziehungspartner
                        exportBeziehungen.push(beziehung)
                      }
                    // jetzt müssen die möglichen Vergleichsoperatoren berücksichtigt werden
                    } else if (beurteileFilterkriterien(feldwert, filterwert, vergleichsoperator)) {
                      exportBeziehungen.push(beziehung)
                    }
                  }
                })
              } else {
                // kein Filter auf Feldern - Beziehung hinzufügen
                // aber sicherstellen, dass sie nicht schon drin ist
                if (!_.contains(exportBeziehungen, beziehung)) {
                  exportBeziehungen.push(beziehung)
                }
              }
            }
          })
          if (exportBeziehungen.length > 0) {
            // jetzt unterscheiden, ob alle Treffer in einem Feld oder pro Treffer eine Zeile exportiert wird
            if (bezInZeilen) {
              // pro Treffer eine neue Zeile erstellen
              schonKopiert = false
              // durch Beziehungen loopen
              exportBeziehungen.forEach(function(exportBeziehung) {
                // exportObjekt kopieren
                var exportObjektKopiert = _.clone(exportObjekt)
                // durch die Felder der Beziehung loopen
                _.each(exportBeziehung, function(
                  exportBeziehungFeldwert,
                  exportBeziehungFeldname
                ) {
                  if (exportBeziehungFeldname === 'Beziehungspartner') {
                    // den Beziehungspartner hinzufügen
                    exportObjektKopiert[feld.DsName + ': ' + exportBeziehungFeldname] = exportBeziehungFeldwert[0]
                    // Reines GUID-Feld ergänzen
                    if (!exportObjektKopiert[feld.DsName + ': Beziehungspartner GUID(s)']) {
                      exportObjektKopiert[feld.DsName + ': Beziehungspartner GUID(s)'] = exportBeziehungFeldwert[0].GUID
                    } else {
                      exportObjektKopiert[feld.DsName + ': Beziehungspartner GUID(s)'] += ', ' + exportBeziehungFeldwert[0].GUID
                    }
                  } else {
                    // Vorsicht: Werte werden kommagetrennt. Also müssen Kommas ersetzt werden
                    if (!exportObjektKopiert[feld.DsName + ': ' + exportBeziehungFeldname]) {
                      exportObjektKopiert[feld.DsName + ': ' + exportBeziehungFeldname] = exportBeziehungFeldwert
                    } else {
                      exportObjektKopiert[feld.DsName + ': ' + exportBeziehungFeldname] += ', ' + exportBeziehungFeldwert
                    }
                  }
                })
                exportObjekte.push(exportObjektKopiert)
                schonKopiert = true
              })
            } else {
              // jeden Treffer kommagetrennt in dasselbe Feld einfügen
              // durch Beziehungen loopen
              exportBeziehungen.forEach(function(exportBeziehung) {
                // durch die Felder der Beziehung loopen
                _.each(exportBeziehung, function(feldwert, feldname) {
                  if (feldname === 'Beziehungspartner') {
                    // zuerst die Beziehungspartner in JSON hinzufügen
                    if (!exportObjekt[feld.DsName + ': ' + feldname]) {
                      exportObjekt[feld.DsName + ': ' + feldname] = ''
                    } else {
                      exportObjekt[feld.DsName + ': ' + feldname] += ', '
                    }
                    exportObjekt[feld.DsName + ': ' + feldname] += JSON.stringify(feldwert[0])
                    // Reines GUID-Feld ergänzen
                    if (!exportObjekt[feld.DsName + ': Beziehungspartner GUID(s)']) {
                      exportObjekt[feld.DsName + ': Beziehungspartner GUID(s)'] = feldwert[0].GUID
                    } else {
                      exportObjekt[feld.DsName + ': Beziehungspartner GUID(s)'] += ', ' + feldwert[0].GUID
                    }
                  // es gibt einen Fehler, wenn replace für einen leeren Wert ausgeführt wird, also kontrollieren
                  } else if (typeof feldwert === 'number') {
                    // Vorsicht: in Nummern können keine Kommas ersetzt werden - gäbe einen error
                    if (!exportObjekt[feld.DsName + ': ' + feldname]) {
                      exportObjekt[feld.DsName + ': ' + feldname] = feldwert
                    } else {
                      exportObjekt[feld.DsName + ': ' + feldname] += ', ' + feldwert
                    }
                  } else {
                    // Vorsicht: Werte werden kommagetrennt. Also müssen Kommas ersetzt werden
                    if (!exportObjekt[feld.DsName + ': ' + feldname]) {
                      exportObjekt[feld.DsName + ': ' + feldname] = feldwert.replace(/,/g, '(Komma)')
                    } else {
                      exportObjekt[feld.DsName + ': ' + feldname] += ', ' + feldwert.replace(/,/g, '(Komma)')
                    }
                  }
                })
              })
            }
          }
        }
      }
    }
  })

  // objekt zu Exportobjekten hinzufügen - wenn nicht schon kopiert
  if (!schonKopiert) {
    exportObjekte.push(exportObjekt)
  }

  return exportObjekte
}
