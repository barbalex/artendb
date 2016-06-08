// Hilfsfunktion, die typeof ersetzt und ergänzt
// typeof gibt bei input-Feldern immer String zurück!

'use strict'

module.exports = function(wert) {
  if (wert === undefined) return 'undefined'
  if (typeof wert === 'boolean') return 'boolean'
  if (
    parseInt(wert, 10) &&
    parseFloat(wert) &&
    parseInt(wert, 10) !== parseFloat(wert) &&
    parseInt(wert, 10) == wert  // eslint-disable-line eqeqeq
  ) {
    return 'float'
  }
  // verhindern, dass führende Nullen abgeschnitten werden
  if (
    (
      parseInt(wert, 10) == wert &&  // eslint-disable-line eqeqeq
      wert.toString().length === Math.ceil(parseInt(wert, 10) / 10)
    ) ||
    wert == '0'  // eslint-disable-line eqeqeq
  ) {
    return 'integer'
  }
  return typeof wert
}
