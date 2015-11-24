// wählt alle Dokumente, die GIS-Layer und Betrachtungsdistanz enthalten
// sowie ihre Synonyme
function (doc) {
  'use strict'

  var findStandardTaxonomyInDoc = require('views/lib/findStandardTaxonomyInDoc')

  if (doc.Typ && doc.Typ === 'Objekt' && doc.Gruppe && doc.Taxonomien) {
    if (doc.Gruppe === 'Fauna' || doc.Gruppe === 'Flora') {
      var standardtaxonomie = findStandardTaxonomyInDoc(doc)
      // sicherstellen, dass Taxonomie-ID existiert
      if (standardtaxonomie && standardtaxonomie.Eigenschaften && standardtaxonomie.Eigenschaften['Taxonomie ID']) {
        // sicherstellen, dass GIS-Layer und Betrachtungsdistanz existieren
        if (doc.Eigenschaftensammlungen) {
          // durch alle Eigenschaftensammlungen loopen
          doc.Eigenschaftensammlungen.forEach(function (datensammlung) {
            if (datensammlung.Name && datensammlung.Name === 'ZH GIS' && datensammlung.Eigenschaften && datensammlung.Eigenschaften['GIS-Layer'] && datensammlung.Eigenschaften['Betrachtungsdistanz (m)']) {
              // ok, alle benötigten Felder sind vorhanden
              // erst mal das eigene Dokument senden
              // der zweite key markiert, dass dies das Original ist
              emit([doc._id, 1])
              if (doc.Beziehungssammlungen) {
                // durch alle Beziehungssammlungen loopen
                doc.Beziehungssammlungen.forEach(function (beziehungssammlung) {
                  if (beziehungssammlung.Typ && beziehungssammlung.Typ === 'taxonomisch' && beziehungssammlung['Art der Beziehungen'] && beziehungssammlung['Art der Beziehungen'] === 'synonym' && beziehungssammlung.Beziehungen && beziehungssammlung.Beziehungen.length > 0) {
                    // jetzt durch alle synonymen Beziehungen loopen
                    beziehungssammlung.Beziehungen.forEach(function (beziehung) {
                      if (beziehung.Beziehungspartner && beziehung.Beziehungspartner.length > 0) {
                        // durch alle Beziehungspartner der synonymen Beziehungen loopen
                        beziehung.Beziehungspartner.forEach(function (bez_partner) {
                          if (bez_partner.GUID) {
                            // veranlassen, dass mit include_docs=true auch das Dokument dieses Synonyms gesendet wird
                            // der zweite key markiert, dass es ein Synonym ist
                            emit([doc._id, 0], {_id: bez_partner.GUID})
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