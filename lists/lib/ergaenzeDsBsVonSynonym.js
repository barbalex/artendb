'use strict'

module.exports = function (objekt, datensammlungenAusSynonymen, beziehungssammlungenAusSynonymen) {
  var dsAusSynNamen = []
  var bsAusSynNamen = []
  var dsAusSynName
  var bsAusSynName

  if (objekt.Eigenschaftensammlungen) {
    if (datensammlungenAusSynonymen) {
      datensammlungenAusSynonymen.forEach(function (datensammlung) {
        if (datensammlung.Name) dsAusSynNamen.push(datensammlung.Name)
      })
    }
    objekt.Eigenschaftensammlungen.forEach(function (datensammlung) {
      dsAusSynName = datensammlung.Name
      if (dsAusSynNamen.length === 0 || dsAusSynName.indexOf(dsAusSynNamen) === -1) {
        datensammlungenAusSynonymen.push(datensammlung)
        // sicherstellen, dass diese ds nicht nochmals gepuscht wird
        dsAusSynNamen.push(dsAusSynName)
      }
    })
  }
  if (objekt.Beziehungssammlungen) {
    if (beziehungssammlungenAusSynonymen) {
      beziehungssammlungenAusSynonymen.forEach(function (beziehungssammlung) {
        if (beziehungssammlung.Name) bsAusSynNamen.push(beziehungssammlung.Name)
      })
    }
    objekt.Beziehungssammlungen.forEach(function (beziehungssammlung) {
      bsAusSynName = beziehungssammlung.Name
      if (bsAusSynNamen.length === 0 || bsAusSynName.indexOf(bsAusSynNamen) === -1) {
        beziehungssammlungenAusSynonymen.push(beziehungssammlung)
        // sicherstellen, dass diese bs nicht nochmals gepuscht wird
        bsAusSynNamen.push(bsAusSynName)
      }
    })
  }
  return [datensammlungenAusSynonymen, beziehungssammlungenAusSynonymen]
}
