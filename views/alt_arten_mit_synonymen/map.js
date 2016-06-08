// wählt alle Dokumente, die GIS-Layer und Betrachtungsdistanz enthalten
// sowie ihre Synonyme
function(doc) {
  'use strict'

  var findStandardTaxonomyInDoc = require('views/lib/findStandardTaxonomyInDoc')
  var _ = require('views/lib/lodash')

  if (
    doc.Typ &&
    doc.Typ === 'Objekt' &&
    doc.Gruppe &&
    doc.Taxonomien
  ) {
    if (
      doc.Gruppe === 'Fauna' ||
      doc.Gruppe === 'Flora'
    ) {
      var standardtaxonomie = findStandardTaxonomyInDoc(doc)
      // sicherstellen, dass Taxonomie-ID existiert
      if (_.has(standardtaxonomie, ['Eigenschaften', 'Taxonomie ID'])) {
        // sicherstellen, dass GIS-Layer und Betrachtungsdistanz existieren
        if (doc.Eigenschaftensammlungen) {
          // durch alle Eigenschaftensammlungen loopen
          doc.Eigenschaftensammlungen.forEach(function(datensammlung) {
            if (
              _.get(datensammlung, 'Name') === 'ZH GIS' &&
              _.has(datensammlung, ['Eigenschaften', 'GIS-Layer']) &&
              _.has(datensammlung, ['Eigenschaften', 'Betrachtungsdistanz (m)'])
            ) {
              // ok, alle benötigten Felder sind vorhanden
              // erst mal das eigene Dokument senden
              // der zweite key markiert, dass dies das Original ist
              emit([doc._id, 1])
              if (doc.Beziehungssammlungen) {
                // durch alle Beziehungssammlungen loopen
                doc.Beziehungssammlungen.forEach(function(beziehungssammlung) {
                  if (
                    _.get(beziehungssammlung, 'Typ') === 'taxonomisch' &&
                    _.get(beziehungssammlung, 'Art der Beziehungen') === 'synonym' &&
                    _.has(beziehungssammlung, 'Beziehungen')
                  ) {
                    // jetzt durch alle synonymen Beziehungen loopen
                    beziehungssammlung.Beziehungen.forEach(function(beziehung) {
                      if (beziehung.Beziehungspartner) {
                        // durch alle Beziehungspartner der synonymen Beziehungen loopen
                        beziehung.Beziehungspartner.forEach(function(bezPartner) {
                          if (bezPartner.GUID) {
                            // veranlassen, dass mit include_docs=true auch das Dokument dieses Synonyms gesendet wird
                            // der zweite key markiert, dass es ein Synonym ist
                            emit([doc._id, 0], {_id: bezPartner.GUID})
                          }
                        })
                      }
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  }
}