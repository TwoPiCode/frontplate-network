'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var selectUrlString = exports.selectUrlString = function selectUrlString(url) {
  return url.toString ? url.toString() : url;
};

var selectBodyJSON = exports.selectBodyJSON = function selectBodyJSON(body) {
  return (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? JSON.stringify(body) : body;
};

/*
  selectStatusColor:
    helper that takes status code and returns hex color code.
*/

var selectStatusColor = exports.selectStatusColor = function selectStatusColor(status) {
  if (!status) {
    return '#f00000';
  }

  if (status >= 100 && status < 200) {
    // 100s - informational
    return '#afafaf';
  } else if (status >= 200 && status < 300) {
    // 200s - ok
    return '#00ae25';
  } else if (status >= 300 && status < 400) {
    // 300s - redirection
    return '#ab00ff';
  } else if (status >= 400 && status < 500) {
    // 400s - client error
    return '#ff8200';
  } else {
    // 500s - server error
    return '#f00000';
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWxlY3RvcnMuanMiXSwibmFtZXMiOlsic2VsZWN0VXJsU3RyaW5nIiwidXJsIiwidG9TdHJpbmciLCJzZWxlY3RCb2R5SlNPTiIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwic2VsZWN0U3RhdHVzQ29sb3IiLCJzdGF0dXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR08sSUFBTUEsNENBQWtCLFNBQWxCQSxlQUFrQixDQUFDQyxHQUFELEVBQXdCO0FBQ3JELFNBQU9BLElBQUlDLFFBQUosR0FBZUQsSUFBSUMsUUFBSixFQUFmLEdBQWdDRCxHQUF2QztBQUNELENBRk07O0FBSUEsSUFBTUUsMENBQWlCLFNBQWpCQSxjQUFpQixDQUFDQyxJQUFELEVBQXlCO0FBQ3JELFNBQU8sUUFBT0EsSUFBUCx5Q0FBT0EsSUFBUCxPQUFnQixRQUFoQixHQUEyQkMsS0FBS0MsU0FBTCxDQUFlRixJQUFmLENBQTNCLEdBQWtEQSxJQUF6RDtBQUNELENBRk07O0FBSVA7Ozs7O0FBS08sSUFBTUcsZ0RBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBQ0MsTUFBRCxFQUF5QjtBQUN4RCxNQUFJLENBQUNBLE1BQUwsRUFBYTtBQUNYLFdBQU8sU0FBUDtBQUNEOztBQUVELE1BQUlBLFVBQVUsR0FBVixJQUFpQkEsU0FBUyxHQUE5QixFQUFtQztBQUNqQztBQUNBLFdBQU8sU0FBUDtBQUNELEdBSEQsTUFHTyxJQUFJQSxVQUFVLEdBQVYsSUFBaUJBLFNBQVMsR0FBOUIsRUFBbUM7QUFDeEM7QUFDQSxXQUFPLFNBQVA7QUFDRCxHQUhNLE1BR0EsSUFBSUEsVUFBVSxHQUFWLElBQWlCQSxTQUFTLEdBQTlCLEVBQW1DO0FBQ3hDO0FBQ0EsV0FBTyxTQUFQO0FBQ0QsR0FITSxNQUdBLElBQUlBLFVBQVUsR0FBVixJQUFpQkEsU0FBUyxHQUE5QixFQUFtQztBQUN4QztBQUNBLFdBQU8sU0FBUDtBQUNELEdBSE0sTUFHQTtBQUNMO0FBQ0EsV0FBTyxTQUFQO0FBQ0Q7QUFDRixDQXJCTSIsImZpbGUiOiJzZWxlY3RvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG5cbmV4cG9ydCBjb25zdCBzZWxlY3RVcmxTdHJpbmcgPSAodXJsOiBPYmplY3R8c3RyaW5nKSA9PiB7XG4gIHJldHVybiB1cmwudG9TdHJpbmcgPyB1cmwudG9TdHJpbmcoKSA6IHVybFxufVxuXG5leHBvcnQgY29uc3Qgc2VsZWN0Qm9keUpTT04gPSAoYm9keTogT2JqZWN0fHN0cmluZykgPT4ge1xuICByZXR1cm4gdHlwZW9mIGJvZHkgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoYm9keSkgOiBib2R5XG59XG5cbi8qXG4gIHNlbGVjdFN0YXR1c0NvbG9yOlxuICAgIGhlbHBlciB0aGF0IHRha2VzIHN0YXR1cyBjb2RlIGFuZCByZXR1cm5zIGhleCBjb2xvciBjb2RlLlxuKi9cblxuZXhwb3J0IGNvbnN0IHNlbGVjdFN0YXR1c0NvbG9yID0gKHN0YXR1czogbnVtYmVyfG51bGwpID0+IHtcbiAgaWYgKCFzdGF0dXMpIHtcbiAgICByZXR1cm4gJyNmMDAwMDAnXG4gIH1cblxuICBpZiAoc3RhdHVzID49IDEwMCAmJiBzdGF0dXMgPCAyMDApIHtcbiAgICAvLyAxMDBzIC0gaW5mb3JtYXRpb25hbFxuICAgIHJldHVybiAnI2FmYWZhZidcbiAgfSBlbHNlIGlmIChzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCkge1xuICAgIC8vIDIwMHMgLSBva1xuICAgIHJldHVybiAnIzAwYWUyNSdcbiAgfSBlbHNlIGlmIChzdGF0dXMgPj0gMzAwICYmIHN0YXR1cyA8IDQwMCkge1xuICAgIC8vIDMwMHMgLSByZWRpcmVjdGlvblxuICAgIHJldHVybiAnI2FiMDBmZidcbiAgfSBlbHNlIGlmIChzdGF0dXMgPj0gNDAwICYmIHN0YXR1cyA8IDUwMCkge1xuICAgIC8vIDQwMHMgLSBjbGllbnQgZXJyb3JcbiAgICByZXR1cm4gJyNmZjgyMDAnXG4gIH0gZWxzZSB7XG4gICAgLy8gNTAwcyAtIHNlcnZlciBlcnJvclxuICAgIHJldHVybiAnI2YwMDAwMCdcbiAgfVxufVxuIl19