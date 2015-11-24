'use strict'

// ergänzt ein Objekt um fehlende Informationen seiner Synonyme
module.exports = function (objekt, datensammlungenAusSynonymen, beziehungssammlungenAusSynonymen) {
  // allfällige DS und BS aus Synonymen anhängen
  // zuerst DS
  // eine Liste der im objekt enthaltenen DsNamen erstellen
  var dsNamen = [],
    bsNamen = [],
    dsAusSynName2,
    bsAusSynName2

  if (objekt.Eigenschaftensammlungen) {
    objekt.Eigenschaftensammlungen.forEach(function (datensammlung) {
      if (datensammlung.Name) dsNamen.push(datensammlung.Name)
    })
  }
  // nicht enthaltene Eigenschaftensammlungen ergänzen
  if (datensammlungenAusSynonymen) {
    datensammlungenAusSynonymen.forEach(function (datensammlung) {
      dsAusSynName2 = datensammlung.Name
      if (dsNamen.length === 0 || dsAusSynName2.indexOf(dsNamen) === -1) {
        objekt.Eigenschaftensammlungen.push(datensammlung)
        // den Namen zu den dsNamen hinzufügen, damit diese DS sicher nicht nochmals gepusht wird, auch nicht, wenn sie von einem anderen Synonym nochmals gebracht wird
        dsNamen.push(dsAusSynName2)
      }
    })
  }
  // jetzt BS aus Synonymen anhängen
  // eine Liste der im objekt enthaltenen BsNamen erstellen
  if (objekt.Beziehungssammlungen) {
    objekt.Beziehungssammlungen.forEach(function (beziehungssammlung) {
      if (beziehungssammlung.Name) bsNamen.push(beziehungssammlung.Name)
    })
  }
  // nicht enthaltene Beziehungssammlungen ergänzen
  if (beziehungssammlungenAusSynonymen) {
    beziehungssammlungenAusSynonymen.forEach(function (beziehungssammlung) {
      bsAusSynName2 = beziehungssammlung.Name
      if (bsNamen.length === 0 || bsAusSynName2.indexOf(bsNamen) === -1) {
        objekt.Beziehungssammlungen.push(beziehungssammlung)
        // den Namen zu den bsNamen hinzufügen, damit diese BS sicher nicht nochmals gepusht wird
        // auch nicht, wenn sie von einem anderen Synonym nochmals gebracht wird
        bsNamen.push(bsAusSynName2)
      }
    })
  }
  return objekt
}
