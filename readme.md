# edp-build-inline

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]

[downloads-image]: http://img.shields.io/npm/dm/edp-build-inline.svg
[npm-url]: https://npmjs.org/package/edp-build-inline
[npm-image]: http://img.shields.io/npm/v/edp-build-inline.svg

> edp-build inline

## Usage

edp-build-config.js:

```
var InlineReplacer = require('edp-build-inline');

exports.getProcessors = function () {

    var inlineReplacer = new InlineReplacer(); 

    return [inlineReplacer];    

});
```

## Related

- [edp-build](https://github.com/ecomfe/edp-build)
