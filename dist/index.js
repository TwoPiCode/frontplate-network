'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONParseError = exports.NetworkError = exports.networkFactory = exports.PATCH = exports.DELETE = exports.PUT = exports.POST = exports.GET = exports.fetchFactory = undefined;

var _fetchFactory = require('./fetchFactory');

var _networkFactory = require('./networkFactory');

var _errors = require('./errors');

require('es6-promise').polyfill();
require('fetch-everywhere');

exports.fetchFactory = _fetchFactory.fetchFactory;
exports.GET = _fetchFactory.GET;
exports.POST = _fetchFactory.POST;
exports.PUT = _fetchFactory.PUT;
exports.DELETE = _fetchFactory.DELETE;
exports.PATCH = _fetchFactory.PATCH;
exports.networkFactory = _networkFactory.networkFactory;
exports.NetworkError = _errors.NetworkError;
exports.JSONParseError = _errors.JSONParseError;
exports.default = _networkFactory.networkFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwicG9seWZpbGwiLCJmZXRjaEZhY3RvcnkiLCJHRVQiLCJQT1NUIiwiUFVUIiwiREVMRVRFIiwiUEFUQ0giLCJuZXR3b3JrRmFjdG9yeSIsIk5ldHdvcmtFcnJvciIsIkpTT05QYXJzZUVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7O0FBQ0E7O0FBQ0E7O0FBTEFBLFFBQVEsYUFBUixFQUF1QkMsUUFBdkI7QUFDQUQsUUFBUSxrQkFBUjs7UUFPRUUsWTtRQUFjQyxHO1FBQUtDLEk7UUFBTUMsRztRQUFLQyxNO1FBQVFDLEs7UUFDdENDLGM7UUFBZ0JDLFk7UUFBY0MsYyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcblxucmVxdWlyZSgnZXM2LXByb21pc2UnKS5wb2x5ZmlsbCgpXG5yZXF1aXJlKCdmZXRjaC1ldmVyeXdoZXJlJylcblxuaW1wb3J0IHsgZmV0Y2hGYWN0b3J5LCBHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCB9IGZyb20gJy4vZmV0Y2hGYWN0b3J5J1xuaW1wb3J0IHsgbmV0d29ya0ZhY3RvcnkgfSBmcm9tICcuL25ldHdvcmtGYWN0b3J5J1xuaW1wb3J0IHsgTmV0d29ya0Vycm9yLCBKU09OUGFyc2VFcnJvciB9IGZyb20gJy4vZXJyb3JzJ1xuXG5leHBvcnQge1xuICBmZXRjaEZhY3RvcnksIEdFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILFxuICBuZXR3b3JrRmFjdG9yeSwgTmV0d29ya0Vycm9yLCBKU09OUGFyc2VFcnJvclxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXR3b3JrRmFjdG9yeVxuIl19