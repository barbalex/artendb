/* eslint ecmaVersion: 5 */
/**
 * Benutzt view flora
 * produziert die API für apflora Artenliste
 */

function(head, req) {
  'use strict'

  start({
    'headers': {
      'Accept-Charset': 'utf-8',
      'Content-Type': 'json; charset=utf-8;'
    }
  })

  var _ = require('lists/lib/lodash')
  var findStandardTaxonomyInDoc = require('lists/lib/findStandardTaxonomyInDoc')
  var row
  var objekt
  var exportObjekte = []
  var exportObjekt
  var dsArtwert
  var dsKef
  var taxonomieId
  var familie
  var artnameVollständig
  var nameDeutsch
  var status
  var artwert
  var artIstKefIndikator
  var erstesKontrolljahr

  // list wird mit view flora abgerufen
  while (row = getRow()) {
    objekt = row.doc

    // exportobjekt gründen bzw. zurücksetzen
    exportObjekt = {}

    // GUID wird gebraucht, um beim Export nach EVAB dem Projekt zuzuweisen
    exportObjekt.GUID = objekt._id

    // zunächst leere Felder anfügen, damit jeder Datensatz jedes Feld hat
    exportObjekt.TaxonomieId = null
    exportObjekt.Familie = null
    exportObjekt.Artname = null
    exportObjekt.NameDeutsch = null
    exportObjekt.Status = null
    exportObjekt.Artwert = null
    exportObjekt.KefArt = null
    exportObjekt.KefKontrolljahr = null

    // Felder aktualisieren, wo Daten vorhanden
    if (objekt.Taxonomien) {
      const standardtaxonomie = findStandardTaxonomyInDoc(objekt)
      if (standardtaxonomie) {

        taxonomieId = _.get(standardtaxonomie, ['Eigenschaften', 'Taxonomie ID'])
        exportObjekt.TaxonomieId = taxonomieId

        familie = _.get(standardtaxonomie, ['Eigenschaften', 'Familie'])
        if (familie) {
          exportObjekt.Familie = familie
        }

        artnameVollständig = _.get(standardtaxonomie, ['Eigenschaften', 'Artname vollständig'])
        if (artnameVollständig) {
          exportObjekt.Artname = artnameVollständig
        }

        // wird beim Export nach EvAB benutzt
        nameDeutsch = _.get(standardtaxonomie, ['Eigenschaften', 'Name Deutsch'])
        if (nameDeutsch) {
          exportObjekt.NameDeutsch = nameDeutsch
        }

        status = _.get(standardtaxonomie, ['Eigenschaften', 'Status'])
        if (status) {
          exportObjekt.Status = status
        }
      }
    }

    if (objekt.Eigenschaftensammlungen) {

      dsArtwert = _.find(objekt.Eigenschaftensammlungen, function(ds) {
        return ds.Name === 'ZH Artwert (aktuell)'
      })
      if (dsArtwert) {
        artwert = _.get(dsArtwert, ['Eigenschaften', 'Artwert'])
        if (artwert || artwert === 0) {
          exportObjekt.Artwert = artwert
        }
      }

      dsKef = _.find(objekt.Eigenschaftensammlungen, function(ds) {
        return ds.Name === 'ZH KEF'
      })
      if (dsKef) {
        artIstKefIndikator = _.get(dsKef, ['Eigenschaften', 'Art ist KEF-Kontrollindikator'])
        if (artIstKefIndikator) {
          // MySQL erwartet für true eine -1
          exportObjekt.KefArt = -1
        }
        erstesKontrolljahr = _.get(dsKef, ['Eigenschaften', 'Erstes Kontrolljahr'])
        if (erstesKontrolljahr) {
          exportObjekt.KefKontrolljahr = erstesKontrolljahr
        }
      }
    }
    
    // objekt zu Exportobjekten hinzufügen
    exportObjekte.push(exportObjekt)
  }

  send(JSON.stringify(exportObjekte))
}