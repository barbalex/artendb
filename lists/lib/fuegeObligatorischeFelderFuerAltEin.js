// fügt die für ALT obligatorischen Felder ein
// und entfernt diese aus dem übergebenen exportObjekt, falls sie schon darin enthalten waren
// erhält das Objekt und das exportObjekt
// retourniert das angepasste exportObjekt

'use strict'

var _ = require('lists/lib/lodash')
var findStandardTaxonomyInDoc = require('lists/lib/findStandardTaxonomyInDoc')

function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value), 10) == value &&  // eslint-disable-line eqeqeq
    !isNaN(parseInt(value, 10))
  )
}

module.exports = function(objekt, exportObjekt) {
  var dsZhArtwert
  var dsZhGis
  var standardtaxonomie = findStandardTaxonomyInDoc(objekt)

  // übergebene Variabeln prüfen
  if (!objekt) return {}
  if (!standardtaxonomie) return {}
  if (!standardtaxonomie.Eigenschaften) return {}
  if (!exportObjekt) exportObjekt = {}

  // sicherstellen, dass GUID korrekt formattiert ist
  var isGuidFormatCorrect = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').test(objekt._id)
  if (!isGuidFormatCorrect) return {}
  // sicherstellen, dass Taxonomie ID ein integer ist
  var taxonomieId = _.get(standardtaxonomie, ['Eigenschaften', 'Taxonomie ID'])
  if (
    !taxonomieId ||
    !isInt(taxonomieId)
  ) {
    return {}
  }

  // Felder ergänzen
  // immer sicherstellen, dass das Feld existiert
  exportObjekt.idArt = '{' + objekt._id + '}'
  exportObjekt.ref = taxonomieId

  if (objekt.Eigenschaftensammlungen === undefined) {
    dsZhGis = {}
  } else {
    dsZhGis = _.find(objekt.Eigenschaftensammlungen, function(ds) {
      return ds.Name === 'ZH GIS'
    }) || {}
  }

  var gisLayer = _.get(dsZhGis, ['Eigenschaften', 'GIS-Layer'])
  if (gisLayer) {
    exportObjekt.gisLayer = gisLayer.substring(0, 50)
  } else {
    // sollte nicht vorkommen, da der view nur objekte mit werten wählt
    exportObjekt.gisLayer = ''
  }

  var betrachtungsdistanz = _.get(dsZhGis, ['Eigenschaften', 'Betrachtungsdistanz (m)'])
  if (
    betrachtungsdistanz &&
    isInt(betrachtungsdistanz)
  ) {
    exportObjekt.distance = betrachtungsdistanz
  } else {
    // sollte nicht vorkommen, da der view nur objekte mit werten wählt
    exportObjekt.distance = 500
  }

  var artname = _.get(standardtaxonomie, ['Eigenschaften', 'Artname'])
  var gattung = _.get(standardtaxonomie, ['Eigenschaften', 'Gattung'])
  var art = _.get(standardtaxonomie, ['Eigenschaften', 'Art'])
  if (
    artname &&
    artname !== '(kein Artname)'
  ) {
    exportObjekt.nameLat = artname.substring(0, 255)
  } else if (gattung) {
    var art = gattung + ' ' + art
    exportObjekt.nameLat = art.substring(0, 255)
  } else {
    exportObjekt.nameLat = '(kein Artname)'
  }

  var nameDeutsch = _.get(standardtaxonomie, ['Eigenschaften', 'Name Deutsch'])
  if (nameDeutsch) {
    exportObjekt.nameDeu = nameDeutsch.substring(0, 255)
  } else {
    exportObjekt.nameDeu = ''
  }

  if (objekt.Eigenschaftensammlungen === undefined) {
    dsZhArtwert = {}
  } else {
    dsZhArtwert = _.find(objekt.Eigenschaftensammlungen, function(ds) {
      return ds.Name === 'ZH Artwert (aktuell)'
    }) || {}
  }

  var artwert = _.get(dsZhArtwert, ['Eigenschaften', 'Artwert'])
  if (
    (artwert && isInt(artwert)) ||
    artwert === 0
  ) {
    exportObjekt.artwert = artwert
  } else {
    exportObjekt.artwert = 0
  }

  return exportObjekt
}
