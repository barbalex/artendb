/**
 * see: http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html#vdufun
 */

function(newDoc, oldDoc, userCtx, secObj) {

  var _ = require('lists/lib/underscore')
  var docIsNew = !oldDoc
  var docWasDeleted = newDoc._deleted === true
  var existingDocWasChanged = !!oldDoc
  var dbRoles = secObj.admins.roles
  var isUserServerOrDatabaseAdmin = function () {
    // see if the user is a server admin
    if (_.contains(userCtx.roles, '_admin')) return true // server admin
    // see if user is a database admin specified by name
    if (secObj && secObj.admins && secObj.admins.names) {
      if (_.contains(secObj.admins.names, userCtx.name)) return true // database admin
    }
    // see if the user a database admin specified by role
    if (secObj && secObj.admins && secObj.admins.roles) {
      userCtx.roles.forEach(function (userRole) {
        if (_.contains(dbRoles, userRole)) return true // user is db admin
      })
    }
    return false // default to no admin
  }
  var userIsServerOrDatabaseAdmin = isUserServerOrDatabaseAdmin()
  var isGuidFormatCorrect = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').test(newDoc._id)
  var guidFormatMessage = 'Das Feld "_id" des Objekts muss folgendermassen zusammengesetzt sein:\n- 32 Zeichen in 5 Gruppen,\n- diese jeweils 8, 4, 4, 4 und 12 Zeichen lang,\n- getrennt durch Bindestriche,\n- erlaubt sind Zeichen zwischen 0 bis 9, a bis f und A bis F.\n\nBeispiel: b8b51fb6-fafc-423a-9a90-f3111b00c6bb'
  var betrachtungsdistanzMessage = 'Jede Art der Gruppen "Fauna" und "Flora" braucht ein GIS-Layer und eine Betrachtungsdistanz, d.h.:\n- eine Eigenschaft "Eigenschaftensammlungen" (ein Array)\n- darin eine Eigenschaftensammlung (= Objekt) mit den nötigen Attributen\n\nSiehe diesen Link:\nhttps://gist.github.com/barbalex/d98aad9a96978b137dde\nbzw. dieses vollständige Beispiel:\nhttps://gist.github.com/barbalex/9836162'
  var organization
  var isUserOrgAdmin = function (org) {
    var orgAdminRole = org + ' org'
    return _.contains(userCtx.roles, orgAdminRole)
  }
  var isUserTaxWriter = function (org) {
    var taxWriterRole = org + ' tax'
    return _.contains(userCtx.roles, taxWriterRole)
  }
  var isUserEsWriter = function (org) {
    var esWriterRole = org + ' es'
    return _.contains(userCtx.roles, esWriterRole)
  }
  var isUserLrWriter = function (org) {
    var lrWriterRole = org + ' lr'
    return _.contains(userCtx.roles, lrWriterRole)
  }
  var taxAdded = []
  var taxRemoved = []
  var esAdded = []
  var esRemoved = []
  var bsAdded = []
  var bsRemoved = []
  var taxChanged = []
  var esChanged = []
  var bsChanged = []
  var taxNamesInOldDoc
  var esNamesInOldDoc
  var bsNamesInOldDoc
  var taxNamesInNewDoc
  var esNamesInNewDoc
  var bsNamesInNewDoc

  // make sure user is logged in
  if (!userCtx.name) throw({unauthorized: 'Sie müssen angemeldet sein'})

  /**
   * If user is admin, wave him through without all the tests that follow?
   * probably not a good idea
   */

  // check objects
  if (newDoc.Typ && newDoc.Typ === 'Objekt') {
    // ensure field "Organisation mit Schreibrecht"
    if (!newDoc['Organisation mit Schreibrecht']) {
      throw({forbidden: 'Objekte müssen das Feld "Organisation mit Schreibrecht" enthalten'})
    }
    // if doc is new, user needs to be one of: orgAdmin, taxWriter, dbAdmin, serverAdmin
    if (docIsNew) {
      organization = newDoc['Organisation mit Schreibrecht']
      if (newDoc.Gruppe && newDoc.Gruppe === 'Lebensräume' && isUserLrWriter(organization)) {
        // this is o.k.
      } else if (!isUserOrgAdmin(organization) && !isUserTaxWriter(organization) && !userIsServerOrDatabaseAdmin) {
        throw({unauthorized: 'Sie können nur neue Objekte schaffen, wenn eine Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
      }
    }
    // if doc was deleted, user needs to be one of: orgAdmin, dbAdmin or serverAdmin
    if (docWasDeleted) {
      organization = newDoc['Organisation mit Schreibrecht']
      if (!isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
        throw({unauthorized: 'Sie können nur neue Objekte schaffen, wenn eine Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
      }
    }
    // make sure guids are formatted correctly
    if (!isGuidFormatCorrect) {
      throw({forbidden: guidFormatMessage})
    }
    // ensure field "Taxonomien"
    if (!newDoc.Taxonomien) {
      throw({forbidden: 'Objekte müssen das Feld "Taxonomien" enthalten (Typ: Array)'})
    }
    if (!_.isArray(newDoc.Taxonomien)) {
      throw({forbidden: 'Das Feld "Taxonomien" muss vom Typ "Array" sein'})
    }
    // ensure field "Eigenschaftensammlungen"
    if (!newDoc.Eigenschaftensammlungen) {
      throw({forbidden: 'Objekte müssen das Feld "Eigenschaftensammlungen" enthalten (Typ: Array)'})
    }
    if (!_.isArray(newDoc.Eigenschaftensammlungen)) {
      throw({forbidden: 'Das Feld "Eigenschaftensammlungen" muss vom Typ "Array" sein'})
    }
    // ensure field "Beziehungssammlungen"
    if (!newDoc.Beziehungssammlungen) {
      throw({forbidden: 'Objekte müssen das Feld "Beziehungssammlungen" enthalten (Typ: Array)'})
    }
    if (!_.isArray(newDoc.Beziehungssammlungen)) {
      throw({forbidden: 'Das Feld "Beziehungssammlungen" muss vom Typ "Array" sein'})
    }
    /**
     * make sure objects of gruppe Fauna and Flora have GIS-Layer and Betrachtungsdistanz
     * they need it to be analysed in ALT
     */
    if (newDoc.Gruppe && (newDoc.Gruppe === 'Fauna' || newDoc.Gruppe === 'Flora')) {
      // these docs are analysed in ALT
      var esZhGis = _.find(newDoc.Eigenschaftensammlungen, function (es) {
        return es.Name === 'ZH GIS'
      })
      if (!esZhGis) throw({forbidden: betrachtungsdistanzMessage})
      if (!esZhGis.Eigenschaften) throw({forbidden: betrachtungsdistanzMessage})
      if (!esZhGis.Eigenschaften['GIS-Layer']) throw({forbidden: betrachtungsdistanzMessage})
      if (esZhGis.Eigenschaften['Betrachtungsdistanz (m)'] === undefined) throw({forbidden: betrachtungsdistanzMessage})
    }
    if (existingDocWasChanged) {
      // analyse changes made to object's taxonomies, property and relation collections
      taxNamesInOldDoc = _.pluck(oldDoc.Taxonomien, 'Name')
      esNamesInOldDoc = _.pluck(oldDoc.Eigenschaftensammlungen, 'Name')
      bsNamesInOldDoc = _.pluck(oldDoc.Beziehungssammlungen, 'Name')
      taxNamesInNewDoc = _.pluck(newDoc.Taxonomien, 'Name')
      esNamesInNewDoc = _.pluck(newDoc.Eigenschaftensammlungen, 'Name')
      bsNamesInNewDoc = _.pluck(newDoc.Beziehungssammlungen, 'Name')
      // build an array of tax / es / bs that were added
      newDoc.Taxonomien.forEach(function (tax) {
        if (tax.Name) {
          var taxInOldDoc = _.find(taxNamesInOldDoc, function (oldDocTaxName) {
            return oldDocTaxName === tax.Name
          })
          if (!taxInOldDoc) taxAdded.push(tax)
        }
      })
      newDoc.Eigenschaftensammlungen.forEach(function (es) {
        if (es.Name) {
          var esInOldDoc = _.find(esNamesInOldDoc, function (oldDocEsName) {
            return oldDocEsName === es.Name
          })
          if (!esInOldDoc) esAdded.push(es)
        }
      })
      newDoc.Beziehungssammlungen.forEach(function (bs) {
        if (bs.Name) {
          var bsInOldDoc = _.find(bsNamesInOldDoc, function (oldDocBsName) {
            return oldDocBsName === bs.Name
          })
          if (!bsInOldDoc) bsAdded.push(bs)
        }
      })
      // build an array of tax / es / bs that were removed
      oldDoc.Taxonomien.forEach(function (tax) {
        if (tax.Name) {
          var taxInNewDoc = _.find(taxNamesInNewDoc, function (newDocTaxName) {
            return newDocTaxName === tax.Name
          })
          if (!taxInNewDoc) taxRemoved.push(tax)
        }
      })
      oldDoc.Eigenschaftensammlungen.forEach(function (es) {
        if (es.Name) {
          var esInNewDoc = _.find(esNamesInNewDoc, function (newDocEsName) {
            return newDocEsName === es.Name
          })
          if (!esInNewDoc) esRemoved.push(es)
        }
      })
      oldDoc.Beziehungssammlungen.forEach(function (bs) {
        if (bs.Name) {
          var bsInNewDoc = _.find(bsNamesInNewDoc, function (newDocBsName) {
            return newDocBsName === bs.Name
          })
          if (!bsInNewDoc) bsRemoved.push(bs)
        }
      })
      // build an array of tax / es / bs that were changed
      newDoc.Taxonomien.forEach(function (tax) {
        if (tax.Name) {
          var taxInOldDoc = _.find(oldDoc.Taxonomien, function (oldDocTax) {
            return oldDocTax.Name && oldDocTax.Name === tax.Name
          })
          if (taxInOldDoc && !_.isEqual(tax, taxInOldDoc)) taxChanged.push(tax)
        }
      })
      newDoc.Eigenschaftensammlungen.forEach(function (es) {
        if (es.Name) {
          var esInOldDoc = _.find(oldDoc.Eigenschaftensammlungen, function (oldDocEs) {
            return oldDocEs.Name && oldDocEs.Name === es.Name
          })
          if (esInOldDoc && !_.isEqual(es, oldDocEs)) esChanged.push(es)
        }
      })
      newDoc.Beziehungssammlungen.forEach(function (bs) {
        if (bs.Name) {
          var bsInOldDoc = _.find(oldDoc.Beziehungssammlungen, function (oldDocBs) {
            return oldDocBs.Name && oldDocBs.Name === bs.Name
          })
          if (bsInOldDoc && !_.isEqual(bs, bsInOldDoc)) bsChanged.push(bs)
        }
      })
      // analyse taxAdded
      taxAdded.forEach(function (tax) {
        // ensure field "Name"
        if (!tax.Name) {
          throw({forbidden: 'Taxonomien müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!tax['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Taxonomien müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = tax['Organisation mit Schreibrecht']
        if (!isUserTaxWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können nur neue Taxonomien schaffen, wenn eine Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse taxChanged
      taxChanged.forEach(function (tax) {
        // ensure field "Name"
        if (!tax.Name) {
          throw({forbidden: 'Taxonomien müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!tax['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Taxonomien müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = tax['Organisation mit Schreibrecht']
        if (!isUserTaxWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Taxonomien nur ändern, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse taxRemoved
      taxRemoved.forEach(function (tax) {
        organization = tax['Organisation mit Schreibrecht']
        if (!isUserTaxWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Taxonomien nur löschen, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse esAdded
      esAdded.forEach(function (es) {
        // ensure field "Name"
        if (!es.Name) {
          throw({forbidden: 'Eigenschaftensammlungen müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!es['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Eigenschaftensammlungen müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = es['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können nur neue Eigenschaftensammlungen schaffen, wenn eine Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse esChanged
      esChanged.forEach(function (es) {
        // ensure field "Name"
        if (!es.Name) {
          throw({forbidden: 'Eigenschaftensammlungen müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!es['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Eigenschaftensammlungen müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = es['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Eigenschaftensammlungen nur ändern, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse esRemoved
      esRemoved.forEach(function (es) {
        organization = es['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Eigenschaftensammlungen nur löschen, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse bsAdded
      bsAdded.forEach(function (bs) {
        // ensure field "Name"
        if (!bs.Name) {
          throw({forbidden: 'Beziehungssammlungen müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!bs['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Beziehungssammlungen müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = bs['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können nur neue Beziehungssammlungen schaffen, wenn eine Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse bsChanged
      bsChanged.forEach(function (bs) {
        // ensure field "Name"
        if (!bs.Name) {
          throw({forbidden: 'Beziehungssammlungen müssen das Feld "Name" enthalten'})
        }
        // ensure field "Organisation mit Schreibrecht"
        if (!bs['Organisation mit Schreibrecht']) {
          throw({forbidden: 'Beziehungssammlungen müssen das Feld "Organisation mit Schreibrecht" enthalten'})
        }
        organization = bs['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Beziehungssammlungen nur ändern, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
      // analyse bsRemoved
      bsRemoved.forEach(function (bs) {
        organization = bs['Organisation mit Schreibrecht']
        if (!isUserEsWriter(organization) && !isUserOrgAdmin(organization) && !userIsServerOrDatabaseAdmin) {
          throw({unauthorized: 'Sie können Beziehungssammlungen nur löschen, wenn die Organisation mit Schreibrechten Ihnen dieses Recht erteilt'})
        }
      })
    }
  } else if (newDoc.Typ && newDoc.Typ === 'Organisation') {
    // ensure field "Name"
    if (!newDoc.Name) {
      throw({forbidden: 'Organisationen müssen das Feld "Name" enthalten'})
    }
    // let org admins change org docs
    if (!isUserOrgAdmin(newDoc.Name) && !userIsServerOrDatabaseAdmin) {
      throw({unauthorized: 'Sie können Dokumente vom Typ "Organisation" nur verändern, wenn Sie Organisations-Administrator sind'})
    }
  } else {
    // this is a doc of type !== Objekt
    if (!userIsServerOrDatabaseAdmin) {
        throw({unauthorized: 'Nur Datenbank- oder Server-Admins dürfen Dokumente verändern, die nicht Objekte sind'})
      }
  }
}
