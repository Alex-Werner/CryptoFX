/**
 * ObjectHelper
 * V 0.1 @ 27/07/2015
 * @type {{init: Function, size: Function}}
 */
var _ = require('lodash');
var objectHandler = {
    merge: function (target, source) {
        
        /* Merges two (or more) objects,
         giving the last one precedence */
        
        if (typeof target !== 'object') {
            target = {};
        }
        
        for (var property in source) {
            
            if (source.hasOwnProperty(property)) {
                
                var sourceProperty = source[property];
                
                if (typeof sourceProperty === 'object') {
                    target[property] = objectHandler.merge(target[property], sourceProperty);
                    continue;
                }
                
                target[property] = sourceProperty;
                
            }
            
        }
        
        for (var a = 2, l = arguments.length; a < l; a++) {
            merge(target, arguments[a]);
        }
        
        return target;
    },
    isProvided: function (variable) {
        return !(typeof variable === 'undefined' || variable === null || variable === undefined)
    },
    init: function () {
        "use strict";
        
        
    },
    formatByteSize: function (bytes, octet) {
        var unit = (octet)?"octets":"bytes";
        var unitLetter = (octet)?"O":"B";
        
        if (bytes < 1024) return bytes+' '+unit;
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " Ki"+unitLetter;
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " Mi"+unitLetter;
        else return (bytes / 1073741824).toFixed(3) + " Gi"+unitLetter;
    },
    sizeof: function (object) {
        "use strict";
        /**
         * Byte sizes are taken from ECMAScript Language Specification
         * http://www.ecma-international.org/ecma-262/5.1/
         * http://bclary.com/2004/11/07/#a-4.3.16
         */
        
        var ECMA_byteSize = {
            STRING: 2,
            BOOLEAN: 4,
            NUMBER: 8
        };
        var objects = [object];
        var bytes = 0;
        var SIZE_FOR_UNRECOGNIZED_TYPE = 0;
        
        
        for (var index = 0; index < objects.length; index++) {
            
            if (_.isObject(object)) {
                var stats = {
                    size: function (obj) {
                        if (_.isString(obj)) {
                            return obj.length * ECMA_byteSize.STRING;
                        }
                        if (_.isBoolean(obj)) {
                            return ECMA_byteSize.BOOLEAN;
                        }
                        if (_.isNumber(obj)) {
                            return ECMA_byteSize.NUMBER;
                        }
                        return SIZE_FOR_UNRECOGNIZED_TYPE;
                    },
                    keys: [], values: [],
                    addKey: function (key) {
                        this.keys.push(key);
                    },
                    addKeyValue: function (key, value) {
                        this.keys.push(key);
                        this.values.push(value);
                    },
                    print: function () {
                        console.log('---\nkeys:\t', this.keys.length);
                        console.log('values:\t', this.values.length, '\n---');
                    },
                    calculateBytes: function () {
                        var all = this.keys.concat(this.values);
                        
                        var map = all.map(function (x) {
                            return stats.size(x);
                        });
                        
                        return map.reduce(function (x, y) {
                            return x + y;
                        }, 0);
                    }
                };
                var collectKeysVal = function (object, stats) {
                    for (var prop in object) {
                        if (object.hasOwnProperty(prop)) {
                            if (_.isObject(object[prop])) {
                                // this key is a reference, count the key and proceed with the referenced value
                                stats.addKey(prop);
                                collectKeysVal(object[prop], stats);
                            } else {
                                stats.addKeyValue(prop, object[prop]);
                            }
                        }
                    }
                    return object;
                };
                
                try {
                    collectKeysVal(object, stats);
                    
                } catch (e) {
                    
                }
                bytes = stats.calculateBytes();
                
            } else if (_.isString(object)) {
                bytes = object.length * ECMA_byteSize.STRING;
            } else if (_.isBoolean(object)) {
                bytes = ECMA_byteSize.BOOLEAN;
            } else if (_.isNumber(object)) {
                bytes = ECMA_byteSize.NUMBER;
            }
            return bytes;
        }
    },
    size: function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
};

module.exports = objectHandler;
module.id = "objectHandler";