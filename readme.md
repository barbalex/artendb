#Das Backend für arteigenschaften.ch 2.0

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![js-standard-style](https://img.shields.io/badge/license-ISC-brightgreen.svg)](https://github.com/FNSKtZH/artendb/blob/master/License.md)

Das ist das Backend bzw. der Code für die Datenbank der künftigen neuen ArtenDb.
Es enthält:

* Die künftig noch für die Schnittstellen benötigten bisherigen Views
* Die entsprechenden Lists
* rewrites
* validate_doc_update, das stark ausgebaut wird
* bald: einen Webserver (hapi.js)
* bald: Schnittstellen (via hapi.js), um Rollen von usern zu ändern, wenn Organisationen ihnen Rechte erteilen

Die Views, die von der neuen ArtenDb verwendet werden, werden mit [ae_views](https://github.com/barbalex/ae_views) erzeugt.

Künftig soll dieses Backend alle Funktionen übernehmen, welche heute noch die CouchApp wahrnimmt. Vor allem sind das die Schnittstellen für EvAB, ALT und apflora.ch.
