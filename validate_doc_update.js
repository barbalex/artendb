/**
 * see: http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html#vdufun
 */

function(newDoc, oldDoc, userCtx, secObj) {

  var _ = require('lists/lib/underscore')

  /**
   * make sure user is logged in
   */
  if (!userCtx.name) throw({unauthorized: 'Sie müssen angemeldet sein'})

  /**
   * TODO: if user is admin, wave him through without all the computations that follow
   */

  /**
   * make sure guids of objects are formatted correctly
   */
  var isGuidFormatCorrect = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').test(newDoc._id)
  var guidFormatMessage = 'Das Feld "_id" des Objekts muss folgendermassen zusammengesetzt sein:\n- 32 Zeichen in 5 Gruppen,\n- diese jeweils 8, 4, 4, 4 und 12 Zeichen lang,\n- getrennt durch Bindestriche,\n- erlaubt sind Zeichen zwischen 0 bis 9, a bis f und A bis F.\n\nBeispiel: b8b51fb6-fafc-423a-9a90-f3111b00c6bb'

  if (newDoc.Typ && newDoc.Typ === 'Objekt' && !isGuidFormatCorrect) {
    throw({forbidden: guidFormatMessage})
  }

  /**
   * make sure objects of gruppe Fauna and Flora have GIS-Layer and Betrachtungsdistanz
   * they need it to be analysed in ALT
   */
  var betrachtungsdistanzMessage = 'Jede Art der Gruppen "Fauna" und "Flora" braucht ein GIS-Layer und eine Betrachtungsdistanz, d.h.:\n- eine Eigenschaft "Eigenschaftensammlungen" (ein Array)\n- darin eine Eigenschaftensammlung (= Objekt) mit den nötigen Attributen\n\nSiehe diesen Link:\nhttps://gist.github.com/barbalex/d98aad9a96978b137dde\nbzw. dieses vollständige Beispiel:\nhttps://gist.github.com/barbalex/9836162'

  if (newDoc.Gruppe && (newDoc.Gruppe === 'Fauna' || newDoc.Gruppe === 'Flora')) {
    // these docs are analysed in ALT
    if (!newDoc.Eigenschaftensammlungen) throw({forbidden: betrachtungsdistanzMessage})
    if (!newDoc.Eigenschaftensammlungen) throw({forbidden: betrachtungsdistanzMessage})
    var esZhGis = _.find(newDoc.Eigenschaftensammlungen, function (es) {
      return es.Name === 'ZH GIS'
    })
    if (!esZhGis) throw({forbidden: betrachtungsdistanzMessage})
    if (!esZhGis.Eigenschaften) throw({forbidden: betrachtungsdistanzMessage})
    if (!esZhGis.Eigenschaften['GIS-Layer']) throw({forbidden: betrachtungsdistanzMessage})
    if (esZhGis.Eigenschaften['Betrachtungsdistanz (m)'] === undefined) throw({forbidden: betrachtungsdistanzMessage})
  }

  /**
   * if doc, Eigenschaftensammlungen, Beziehungssammlungen or Taxonomien were changed
   * user needs the correct role
   *
   * This is the plan:
   * 
   * - check if doc is new. If true:
   *   - exists "Organisation mit Schreibrecht"?
   *   - does user have correct role to create it?
   *
   * - check if doc was deleted ('if (newDoc._deleted === true)'). If true:
   *   - does user have correct role to delete it? (= do his roles contain 'orgname org')
   *
   * repeat for pcs, rcs, taxonomies:
   * - build array of collections that were added. Loop them and check:
   *   - exists "Organisation mit Schreibrecht"?
   *   - does user have correct role to add it?
   * 
   * - build array of collections that were removed. Loop them and check:
   *   - does user have correct role to remove it?
   * 
   * - build array of all other collections. Loop them and check:
   *   - was the collection changed (https://lodash.com/docs#isEqual)? If true:
   *     - does user have correct role to change it?
   *
   */
}
