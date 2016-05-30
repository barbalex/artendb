/* eslint ecmaVersion: 5 */
/**
 * Benutzt view evab_arten
 * produziert die API für ALT gemäss Vorgaben der EBP
 */

function(head, req) {
  'use strict'
  
  start({
    'headers': {
      'Accept-Charset': 'utf-8',
      'Content-Type': 'json; charset=utf-8;',
      'Accept-Encoding': 'gzip,deflate'
    }
  })

  var _ = require('lists/lib/lodash')
  var codiereFloraStatus = require('lists/lib/codiereFloraStatus')
  var findStandardTaxonomyInDoc = require('lists/lib/findStandardTaxonomyInDoc')
  var row
  var Objekt
  var exportObjekte = []
  var exportObjekt
  var floraStatusCodiert
  var standardtaxonomie
  var taxonomieId
  var artname
  var gattung
  var art
  var gattungArt
  var nameDeutsch
  var dsZhGis
  var gisLayer
  var status

  while (row = getRow()) {
    Objekt = row.doc
    standardtaxonomie = findStandardTaxonomyInDoc(Objekt)

    // exportobjekt gründen bzw. zurücksetzen
    exportObjekt = {}

    // bei allen Gruppen gleiche Eigenschaften setzen
    exportObjekt.idArt = '{' + Objekt._id + '}'

    taxonomieId = _.get(standardtaxonomie, ['Eigenschaften', 'Taxonomie ID'])
    if (taxonomieId) {
      exportObjekt.nummer = taxonomieId
    }

    artname = _.get(standardtaxonomie, ['Eigenschaften', 'Artname'])
    gattung = _.get(standardtaxonomie, ['Eigenschaften', 'Gattung'])
    art = _.get(standardtaxonomie, ['Eigenschaften', 'Art'])
    if (artname) {
      // darf max. 255 Zeichen lang sein
      exportObjekt.wissenschArtname = artname.substring(0, 255)
    } else if (gattung || art) {
      // Feld Artname ist nicht obligatorisch
      gattungArt = gattung ? gattung + ' ' + art : art
      exportObjekt.wissenschArtname = gattungArt.substring(0, 255)
    } else {
      exportObjekt.wissenschArtname = '(kein Artname)'
    }

    nameDeutsch = _.get(standardtaxonomie, ['Eigenschaften', 'Name Deutsch'])
    // Name Deutsch existiert bei Moosen nicht, das macht aber nichts
    if (nameDeutsch) {
      // darf max. 255 Zeichen lang sein
      exportObjekt.deutscherArtname = nameDeutsch.substring(0, 255)
    }

    // gruppen-abhängige Eigenschaften setzen
    switch(Objekt.Gruppe) {

    case 'Fauna':
      // Status ist bei Fauna immer A
      exportObjekt.status = 'A'

      // Datensammlung 'ZH GIS' holen
      dsZhGis = _.find(Objekt.Eigenschaftensammlungen, function(ds) {
        return ds.Name === 'ZH GIS'
      }) || {}
      gisLayer = _.get(dsZhGis, ['Eigenschaften', 'GIS-Layer'])
      if (gisLayer) {
        // klasse darf max. 50 Zeichen lang sein
        exportObjekt.klasse = gisLayer.substring(0, 50)
      }
      break

    case 'Flora':
      // Felder aktualisieren, wo Daten vorhanden
      status = _.get(standardtaxonomie, ['Eigenschaften', 'Status'])
      if (status) {
        // Status codieren
        floraStatusCodiert = codiereFloraStatus(status)
        if (floraStatusCodiert) {
          exportObjekt.status = floraStatusCodiert
        }
      }
      // GIS-Layer ist bei Flora immer Flora
      exportObjekt.klasse = 'Flora'
      break

    case 'Moose':
      // Status ist bei Moose immer A
      exportObjekt.status = 'A'
      // GIS-Layer ist bei Moose immer Moose
      exportObjekt.klasse = 'Moose'
      break

    default:
      // zum nächsten row
      continue
    }
    
    // Objekt zu Exportobjekten hinzufügen
    exportObjekte.push(exportObjekt)
  }

  send(JSON.stringify(exportObjekte))
}