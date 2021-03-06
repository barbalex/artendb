function(head, req) {
  'use strict'

  start({
    'headers': {
      'Content-Type': 'json; charset=utf-8;',
      'Content-disposition': 'attachment;filename=Arten.json',
      'Accept-Charset': 'utf-8'
    }
  })

  var _ = require ('lists/lib/lodash')
  var findStandardTaxonomyInDoc = require('lists/lib/findStandardTaxonomyInDoc')
  var row
  var doc
  var exportJson = {}
  var art
  var eigenschaftensammlungZhGis
  var beziehungssammlungOffizielleArt
  var beziehungssammlungAkzeptierteReferenz
  var k
  var standardtaxonomie
  var floraSynonymName
  var mooseSynonymName

  exportJson.docs = []

  while (row = getRow()) {
    doc = row.doc
    art = {}
    art._id = doc._id
    art.Typ = 'Arteigenschaft'
    standardtaxonomie = findStandardTaxonomyInDoc(doc)

    eigenschaftensammlungZhGis = _.find(doc.Eigenschaftensammlungen, function(eigenschaftensammlung) {
      return eigenschaftensammlung.Name === 'ZH GIS'
    })
    if (eigenschaftensammlungZhGis) {
      art.ArtGruppe = eigenschaftensammlungZhGis.Eigenschaften['GIS-Layer']
        .replace(/ae/g, 'ä')
        .replace(/oe/g, 'ö')
        .replace(/ue/g, 'ü')
    }

    art['Taxonomie ID'] = standardtaxonomie.Eigenschaften['Taxonomie ID']
    art.Artname = standardtaxonomie.Eigenschaften['Artname vollständig']

    // Hinweis Verwandschaft
    if (doc.Gruppe === 'Flora' && doc.Beziehungssammlungen) {
      beziehungssammlungOffizielleArt = _.find(doc.Beziehungssammlungen, function(beziehungssammlung) {
        return beziehungssammlung.Name === 'SISF Index 2 (2005): offizielle Art'
      })
      if (beziehungssammlungOffizielleArt) {
        floraSynonymName = _.get(beziehungssammlungOffizielleArt, 'Beziehungen[0].Beziehungspartner[0].Name')
        if (floraSynonymName) {
          art.HinweisVerwandschaft = 'Achtung: Synonym von ' + floraSynonymName
        }
      }
    }
    if (doc.Gruppe === 'Moose') {
      beziehungssammlungAkzeptierteReferenz = _.find(doc.Beziehungssammlungen, function(beziehungssammlung) {
        return beziehungssammlung.Name === 'NISM (2010): akzeptierte Referenz'
      })
      if (beziehungssammlungAkzeptierteReferenz) {
        mooseSynonymName = _.get(beziehungssammlungAkzeptierteReferenz, 'Beziehungen[0].Beziehungspartner[0].Name')
        if (mooseSynonymName) {
          art.HinweisVerwandschaft = 'Achtung: Synonym von ' + mooseSynonymName
        }
      }
    }
    if (doc.Gruppe === 'Macromycetes') {
      // bei Pilzen fehlt momentan in arteigenschaften.ch der GIS-Layer
      art.ArtGruppe = 'Pilze'
    }
    exportJson.docs.push(art)
  }
  send(JSON.stringify(exportJson))
}