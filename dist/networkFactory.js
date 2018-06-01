'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.networkFactory = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _safeUrlAssembler = require('safe-url-assembler');

var _safeUrlAssembler2 = _interopRequireDefault(_safeUrlAssembler);

var _fetchFactory = require('./fetchFactory');

var _selectors = require('./selectors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  logFactory:
    returns a console.info wrapper that respects @show.
*/

var INFO = 'info';

var logFactory = function logFactory() {
  var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  return function (type) {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return show ? (_console = console)[type].apply(_console, args) : null; // eslint-disable-line
  };
};

/*
  fakeFactory:
    helper function to networkFactory. returns a promise that passed url part to
    resolver function that then returns an Object that mocks data from an API.
*/

var fakeFetchFactory = function fakeFetchFactory(rootUrl) {
  var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return null;
  };

  return function (url) {
    return new Promise(function (resolve) {
      var endpoint = (url || '').replace(rootUrl, '');
      var data = resolver && resolver(endpoint) || null;
      var response = new Response(JSON.stringify(data), {});
      return resolve((0, _fetchFactory.resolveResponse)(response));
    });
  };
};

/*
  networkFactory:
    helper that takes @config object and @resolver function for data testing,
    and @resolver that accepts a function that takes a url/endpoint to then
    return a predefined object to immitate a resolved resposne for offline
    testing.
*/

var networkFactory = exports.networkFactory = function networkFactory() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var hostUrl = config.hostUrl,
      demoUrl = config.demoUrl,
      _config$enableDemo = config.enableDemo,
      enableDemo = _config$enableDemo === undefined ? true : _config$enableDemo,
      _config$enableLogging = config.enableLogging,
      enableLogging = _config$enableLogging === undefined ? true : _config$enableLogging,
      _config$loggingHostIn = config.loggingHostInfo,
      loggingHostInfo = _config$loggingHostIn === undefined ? true : _config$loggingHostIn,
      _config$loggingReques = config.loggingRequest,
      loggingRequest = _config$loggingReques === undefined ? true : _config$loggingReques,
      _config$loggingRespon = config.loggingResponse,
      loggingResponse = _config$loggingRespon === undefined ? true : _config$loggingRespon;


  var api = (0, _safeUrlAssembler2.default)(hostUrl);
  var log = logFactory(enableLogging);

  if (loggingHostInfo) {
    log(INFO, '\u2705 API: ' + hostUrl);
  }

  var requestFactory = function requestFactory(method) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var realRequest = (0, _fetchFactory.fetchFactory)(method, options);
    var fakeRequest = fakeFetchFactory(hostUrl, resolver);

    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      // BEFORE REQUEST
      var url = (0, _selectors.selectUrlString)(args[0]);
      args[0] = url;

      var requestBody = args[1] || null;

      var startTime = new Date().getTime();
      var endpoint = (url || '').replace(hostUrl, '');

      var isDemoHost = demoUrl ? enableDemo && (url || '').indexOf(demoUrl) === 0 : false;
      var request = isDemoHost ? fakeRequest : realRequest;

      log(INFO, '\u2935 %c[---] ' + method + ' %c' + endpoint, 'color:#999;', 'color:black;', _extends({}, loggingRequest ? { request: requestBody } : {}));

      // REQUEST! $FlowIgnore
      return request.apply(undefined, args)

      // AFTER REQUEST
      .catch(function (response) {
        var endTime = new Date().getTime();
        var deltaTime = endTime - startTime;

        var status = null;
        var body = null;

        // if error is a Network error use object data
        if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
          status = response.status || status;
          body = response.body || body;
        }

        log(INFO, '\u2934 %c[' + (status || '!!!') + '] ' + method + ' %c' + endpoint + ' (' + deltaTime + 'ms)', 'color:' + (0, _selectors.selectStatusColor)(status), 'color:black;', _extends({}, loggingRequest ? { request: requestBody } : {}, loggingResponse ? { response: body } : {}));

        options.onResponse && options.onResponse(status, body, response);

        // Raise an actual error
        throw response;
      }).then(function (response) {
        var endTime = new Date().getTime();
        var deltaTime = endTime - startTime;

        var status = response.status,
            body = response.body;


        log(INFO, '\u2934 %c[' + status + '] ' + method + ' %c' + endpoint + ' (' + deltaTime + 'ms) %c' + (isDemoHost ? '[demo]' : ''), 'color:' + (0, _selectors.selectStatusColor)(status), 'color:black;', 'color:blue;', _extends({}, loggingRequest ? { request: requestBody } : {}, loggingResponse ? { response: body } : {}));

        options.onResponse && options.onResponse(status, body, response);

        return body;
      });
    };
  };

  return {
    api: api,
    requestFactory: requestFactory
  };
};

exports.default = networkFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXR3b3JrRmFjdG9yeS5qcyJdLCJuYW1lcyI6WyJJTkZPIiwibG9nRmFjdG9yeSIsInNob3ciLCJ0eXBlIiwiYXJncyIsImZha2VGZXRjaEZhY3RvcnkiLCJyb290VXJsIiwicmVzb2x2ZXIiLCJ1cmwiLCJQcm9taXNlIiwiZW5kcG9pbnQiLCJyZXBsYWNlIiwiZGF0YSIsInJlc3BvbnNlIiwiUmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5IiwicmVzb2x2ZSIsIm5ldHdvcmtGYWN0b3J5IiwiY29uZmlnIiwiaG9zdFVybCIsImRlbW9VcmwiLCJlbmFibGVEZW1vIiwiZW5hYmxlTG9nZ2luZyIsImxvZ2dpbmdIb3N0SW5mbyIsImxvZ2dpbmdSZXF1ZXN0IiwibG9nZ2luZ1Jlc3BvbnNlIiwiYXBpIiwibG9nIiwicmVxdWVzdEZhY3RvcnkiLCJtZXRob2QiLCJvcHRpb25zIiwicmVhbFJlcXVlc3QiLCJmYWtlUmVxdWVzdCIsInJlcXVlc3RCb2R5Iiwic3RhcnRUaW1lIiwiRGF0ZSIsImdldFRpbWUiLCJpc0RlbW9Ib3N0IiwiaW5kZXhPZiIsInJlcXVlc3QiLCJjYXRjaCIsImVuZFRpbWUiLCJkZWx0YVRpbWUiLCJzdGF0dXMiLCJib2R5Iiwib25SZXNwb25zZSIsInRoZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBR0E7Ozs7QUFFQTs7QUFDQTs7OztBQUVBOzs7OztBQUtBLElBQU1BLE9BQU8sTUFBYjs7QUFFQSxJQUFNQyxhQUFhLFNBQWJBLFVBQWEsR0FBMkI7QUFBQSxNQUExQkMsSUFBMEIsdUVBQVYsS0FBVTs7QUFDNUMsU0FBTyxVQUFDQyxJQUFELEVBQXlDO0FBQUE7O0FBQUEsc0NBQXZCQyxJQUF1QjtBQUF2QkEsVUFBdUI7QUFBQTs7QUFDOUMsV0FBT0YsT0FBTyxxQkFBUUMsSUFBUixrQkFBaUJDLElBQWpCLENBQVAsR0FBZ0MsSUFBdkMsQ0FEOEMsQ0FDRjtBQUM3QyxHQUZEO0FBR0QsQ0FKRDs7QUFNQTs7Ozs7O0FBTUEsSUFBTUMsbUJBQW1CLFNBQW5CQSxnQkFBbUIsQ0FDdkJDLE9BRHVCLEVBR3BCO0FBQUEsTUFESEMsUUFDRyx1RUFEd0I7QUFBQSxXQUFNLElBQU47QUFBQSxHQUN4Qjs7QUFDSCxTQUFPLFVBQ0xDLEdBREssRUFFRjtBQUNILFdBQU8sSUFBSUMsT0FBSixDQUFZLG1CQUFXO0FBQzVCLFVBQU1DLFdBQVcsQ0FBQ0YsT0FBTyxFQUFSLEVBQVlHLE9BQVosQ0FBb0JMLE9BQXBCLEVBQTZCLEVBQTdCLENBQWpCO0FBQ0EsVUFBTU0sT0FBUUwsWUFBWUEsU0FBU0csUUFBVCxDQUFiLElBQW9DLElBQWpEO0FBQ0EsVUFBTUcsV0FBVyxJQUFJQyxRQUFKLENBQWFDLEtBQUtDLFNBQUwsQ0FBZUosSUFBZixDQUFiLEVBQW1DLEVBQW5DLENBQWpCO0FBRUEsYUFBT0ssUUFBUSxtQ0FBZ0JKLFFBQWhCLENBQVIsQ0FBUDtBQUNELEtBTk0sQ0FBUDtBQU9ELEdBVkQ7QUFXRCxDQWZEOztBQWlCQTs7Ozs7Ozs7QUFRTyxJQUFNSywwQ0FBaUIsU0FBakJBLGNBQWlCLEdBR3pCO0FBQUEsTUFGSEMsTUFFRyx1RUFGYyxFQUVkO0FBQUEsTUFESFosUUFDRyx1RUFEd0IsSUFDeEI7QUFBQSxNQUVEYSxPQUZDLEdBU0NELE1BVEQsQ0FFREMsT0FGQztBQUFBLE1BR0RDLE9BSEMsR0FTQ0YsTUFURCxDQUdERSxPQUhDO0FBQUEsMkJBU0NGLE1BVEQsQ0FJREcsVUFKQztBQUFBLE1BSURBLFVBSkMsc0NBSVksSUFKWjtBQUFBLDhCQVNDSCxNQVRELENBS0RJLGFBTEM7QUFBQSxNQUtEQSxhQUxDLHlDQUtlLElBTGY7QUFBQSw4QkFTQ0osTUFURCxDQU1ESyxlQU5DO0FBQUEsTUFNREEsZUFOQyx5Q0FNaUIsSUFOakI7QUFBQSw4QkFTQ0wsTUFURCxDQU9ETSxjQVBDO0FBQUEsTUFPREEsY0FQQyx5Q0FPZ0IsSUFQaEI7QUFBQSw4QkFTQ04sTUFURCxDQVFETyxlQVJDO0FBQUEsTUFRREEsZUFSQyx5Q0FRaUIsSUFSakI7OztBQVdILE1BQU1DLE1BQU0sZ0NBQWlCUCxPQUFqQixDQUFaO0FBQ0EsTUFBTVEsTUFBTTNCLFdBQVdzQixhQUFYLENBQVo7O0FBRUEsTUFBSUMsZUFBSixFQUFxQjtBQUNuQkksUUFBSTVCLElBQUosbUJBQW9Cb0IsT0FBcEI7QUFDRDs7QUFFRCxNQUFNUyxpQkFBaUIsU0FBakJBLGNBQWlCLENBQ3JCQyxNQURxQixFQUdsQjtBQUFBLFFBREhDLE9BQ0csdUVBRGdCLEVBQ2hCOztBQUNILFFBQU1DLGNBQWMsZ0NBQWFGLE1BQWIsRUFBcUJDLE9BQXJCLENBQXBCO0FBQ0EsUUFBTUUsY0FBYzVCLGlCQUFpQmUsT0FBakIsRUFBMEJiLFFBQTFCLENBQXBCOztBQUVBLFdBQU8sWUFFRjtBQUFBLHlDQURBSCxJQUNBO0FBREFBLFlBQ0E7QUFBQTs7QUFFSDtBQUNBLFVBQU1JLE1BQU0sZ0NBQWdCSixLQUFLLENBQUwsQ0FBaEIsQ0FBWjtBQUNBQSxXQUFLLENBQUwsSUFBVUksR0FBVjs7QUFFQSxVQUFNMEIsY0FBYzlCLEtBQUssQ0FBTCxLQUFXLElBQS9COztBQUVBLFVBQU0rQixZQUFhLElBQUlDLElBQUosRUFBRCxDQUFhQyxPQUFiLEVBQWxCO0FBQ0EsVUFBTTNCLFdBQVcsQ0FBQ0YsT0FBTyxFQUFSLEVBQVlHLE9BQVosQ0FBb0JTLE9BQXBCLEVBQTZCLEVBQTdCLENBQWpCOztBQUVBLFVBQU1rQixhQUFhakIsVUFBVUMsY0FBZSxDQUFDZCxPQUFPLEVBQVIsRUFBWStCLE9BQVosQ0FBb0JsQixPQUFwQixNQUFpQyxDQUExRCxHQUErRCxLQUFsRjtBQUNBLFVBQU1tQixVQUFVRixhQUFhTCxXQUFiLEdBQTJCRCxXQUEzQzs7QUFFQUosVUFDRTVCLElBREYsc0JBRWU4QixNQUZmLFdBRTJCcEIsUUFGM0IsRUFHRSxhQUhGLEVBR2lCLGNBSGpCLGVBS1FlLGlCQUFpQixFQUFDZSxTQUFTTixXQUFWLEVBQWpCLEdBQTBDLEVBTGxEOztBQVNBO0FBQ0EsYUFBT00seUJBQVdwQyxJQUFYOztBQUVMO0FBRkssT0FHSnFDLEtBSEksQ0FHRSxvQkFBWTtBQUNqQixZQUFNQyxVQUFXLElBQUlOLElBQUosRUFBRCxDQUFhQyxPQUFiLEVBQWhCO0FBQ0EsWUFBTU0sWUFBWUQsVUFBVVAsU0FBNUI7O0FBRUEsWUFBSVMsU0FBUyxJQUFiO0FBQ0EsWUFBSUMsT0FBTyxJQUFYOztBQUVBO0FBQ0EsWUFBSSxRQUFPaEMsUUFBUCx5Q0FBT0EsUUFBUCxPQUFvQixRQUF4QixFQUFrQztBQUNoQytCLG1CQUFTL0IsU0FBUytCLE1BQVQsSUFBbUJBLE1BQTVCO0FBQ0FDLGlCQUFPaEMsU0FBU2dDLElBQVQsSUFBaUJBLElBQXhCO0FBQ0Q7O0FBRURqQixZQUNFNUIsSUFERixrQkFFVTRDLFVBQVUsS0FGcEIsV0FFOEJkLE1BRjlCLFdBRTBDcEIsUUFGMUMsVUFFdURpQyxTQUZ2RCxxQkFHVyxrQ0FBa0JDLE1BQWxCLENBSFgsRUFHd0MsY0FIeEMsZUFLUW5CLGlCQUFpQixFQUFDZSxTQUFTTixXQUFWLEVBQWpCLEdBQTBDLEVBTGxELEVBTVFSLGtCQUFrQixFQUFDYixVQUFVZ0MsSUFBWCxFQUFsQixHQUFxQyxFQU43Qzs7QUFVQWQsZ0JBQVFlLFVBQVIsSUFBc0JmLFFBQVFlLFVBQVIsQ0FBbUJGLE1BQW5CLEVBQTJCQyxJQUEzQixFQUFpQ2hDLFFBQWpDLENBQXRCOztBQUVBO0FBQ0EsY0FBTUEsUUFBTjtBQUNELE9BOUJJLEVBK0JKa0MsSUEvQkksQ0ErQkMsb0JBQVk7QUFDaEIsWUFBTUwsVUFBVyxJQUFJTixJQUFKLEVBQUQsQ0FBYUMsT0FBYixFQUFoQjtBQUNBLFlBQU1NLFlBQVlELFVBQVVQLFNBQTVCOztBQUZnQixZQUlSUyxNQUpRLEdBSVMvQixRQUpULENBSVIrQixNQUpRO0FBQUEsWUFJQUMsSUFKQSxHQUlTaEMsUUFKVCxDQUlBZ0MsSUFKQTs7O0FBTWhCakIsWUFDRTVCLElBREYsaUJBRVU0QyxNQUZWLFVBRXFCZCxNQUZyQixXQUVpQ3BCLFFBRmpDLFVBRThDaUMsU0FGOUMsZUFFZ0VMLGFBQWEsUUFBYixHQUF3QixFQUZ4RixjQUdXLGtDQUFrQk0sTUFBbEIsQ0FIWCxFQUd3QyxjQUh4QyxFQUd3RCxhQUh4RCxlQUtRbkIsaUJBQWlCLEVBQUNlLFNBQVNOLFdBQVYsRUFBakIsR0FBMEMsRUFMbEQsRUFNUVIsa0JBQWtCLEVBQUNiLFVBQVVnQyxJQUFYLEVBQWxCLEdBQXFDLEVBTjdDOztBQVVBZCxnQkFBUWUsVUFBUixJQUFzQmYsUUFBUWUsVUFBUixDQUFtQkYsTUFBbkIsRUFBMkJDLElBQTNCLEVBQWlDaEMsUUFBakMsQ0FBdEI7O0FBRUEsZUFBT2dDLElBQVA7QUFDRCxPQWxESSxDQUFQO0FBbURELEtBN0VEO0FBOEVELEdBckZEOztBQXVGQSxTQUFPO0FBQ0xsQixZQURLO0FBRUxFO0FBRkssR0FBUDtBQUlELENBaEhNOztrQkFrSFFYLGMiLCJmaWxlIjoibmV0d29ya0ZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG5cbmltcG9ydCBTYWZlVXJsQXNzZW1ibGVyIGZyb20gJ3NhZmUtdXJsLWFzc2VtYmxlcidcblxuaW1wb3J0IHsgZmV0Y2hGYWN0b3J5LCByZXNvbHZlUmVzcG9uc2UgfSBmcm9tICcuL2ZldGNoRmFjdG9yeSdcbmltcG9ydCB7IHNlbGVjdFVybFN0cmluZywgc2VsZWN0U3RhdHVzQ29sb3IgfSBmcm9tICcuL3NlbGVjdG9ycydcblxuLypcbiAgbG9nRmFjdG9yeTpcbiAgICByZXR1cm5zIGEgY29uc29sZS5pbmZvIHdyYXBwZXIgdGhhdCByZXNwZWN0cyBAc2hvdy5cbiovXG5cbmNvbnN0IElORk8gPSAnaW5mbydcblxuY29uc3QgbG9nRmFjdG9yeSA9IChzaG93OiBib29sZWFuID0gZmFsc2UpID0+IHtcbiAgcmV0dXJuICh0eXBlOiBzdHJpbmcsIC4uLmFyZ3M6IEFycmF5PG1peGVkPikgPT4ge1xuICAgIHJldHVybiBzaG93ID8gY29uc29sZVt0eXBlXSguLi5hcmdzKSA6IG51bGwgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB9XG59XG5cbi8qXG4gIGZha2VGYWN0b3J5OlxuICAgIGhlbHBlciBmdW5jdGlvbiB0byBuZXR3b3JrRmFjdG9yeS4gcmV0dXJucyBhIHByb21pc2UgdGhhdCBwYXNzZWQgdXJsIHBhcnQgdG9cbiAgICByZXNvbHZlciBmdW5jdGlvbiB0aGF0IHRoZW4gcmV0dXJucyBhbiBPYmplY3QgdGhhdCBtb2NrcyBkYXRhIGZyb20gYW4gQVBJLlxuKi9cblxuY29uc3QgZmFrZUZldGNoRmFjdG9yeSA9IChcbiAgcm9vdFVybDogc3RyaW5nLFxuICByZXNvbHZlcj86IEZ1bmN0aW9ufG51bGwgPSAoKSA9PiBudWxsXG4pID0+IHtcbiAgcmV0dXJuIChcbiAgICB1cmw6IHN0cmluZ1xuICApID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBlbmRwb2ludCA9ICh1cmwgfHwgJycpLnJlcGxhY2Uocm9vdFVybCwgJycpXG4gICAgICBjb25zdCBkYXRhID0gKHJlc29sdmVyICYmIHJlc29sdmVyKGVuZHBvaW50KSkgfHwgbnVsbFxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoZGF0YSksIHtcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZShyZXNvbHZlUmVzcG9uc2UocmVzcG9uc2UpKVxuICAgIH0pXG4gIH1cbn1cblxuLypcbiAgbmV0d29ya0ZhY3Rvcnk6XG4gICAgaGVscGVyIHRoYXQgdGFrZXMgQGNvbmZpZyBvYmplY3QgYW5kIEByZXNvbHZlciBmdW5jdGlvbiBmb3IgZGF0YSB0ZXN0aW5nLFxuICAgIGFuZCBAcmVzb2x2ZXIgdGhhdCBhY2NlcHRzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIHVybC9lbmRwb2ludCB0byB0aGVuXG4gICAgcmV0dXJuIGEgcHJlZGVmaW5lZCBvYmplY3QgdG8gaW1taXRhdGUgYSByZXNvbHZlZCByZXNwb3NuZSBmb3Igb2ZmbGluZVxuICAgIHRlc3RpbmcuXG4qL1xuXG5leHBvcnQgY29uc3QgbmV0d29ya0ZhY3RvcnkgPSAoXG4gIGNvbmZpZzogT2JqZWN0ID0ge30sXG4gIHJlc29sdmVyPzogRnVuY3Rpb258bnVsbCA9IG51bGwsXG4pID0+IHtcbiAgY29uc3Qge1xuICAgIGhvc3RVcmwsXG4gICAgZGVtb1VybCxcbiAgICBlbmFibGVEZW1vID0gdHJ1ZSxcbiAgICBlbmFibGVMb2dnaW5nID0gdHJ1ZSxcbiAgICBsb2dnaW5nSG9zdEluZm8gPSB0cnVlLFxuICAgIGxvZ2dpbmdSZXF1ZXN0ID0gdHJ1ZSxcbiAgICBsb2dnaW5nUmVzcG9uc2UgPSB0cnVlXG4gIH0gPSBjb25maWdcblxuICBjb25zdCBhcGkgPSBTYWZlVXJsQXNzZW1ibGVyKGhvc3RVcmwpXG4gIGNvbnN0IGxvZyA9IGxvZ0ZhY3RvcnkoZW5hYmxlTG9nZ2luZylcblxuICBpZiAobG9nZ2luZ0hvc3RJbmZvKSB7XG4gICAgbG9nKElORk8sIGDinIUgQVBJOiAke2hvc3RVcmx9YClcbiAgfVxuXG4gIGNvbnN0IHJlcXVlc3RGYWN0b3J5ID0gKFxuICAgIG1ldGhvZDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fVxuICApID0+IHtcbiAgICBjb25zdCByZWFsUmVxdWVzdCA9IGZldGNoRmFjdG9yeShtZXRob2QsIG9wdGlvbnMpXG4gICAgY29uc3QgZmFrZVJlcXVlc3QgPSBmYWtlRmV0Y2hGYWN0b3J5KGhvc3RVcmwsIHJlc29sdmVyKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIC4uLmFyZ3M6IEFycmF5PGFueT5cbiAgICApID0+IHtcblxuICAgICAgLy8gQkVGT1JFIFJFUVVFU1RcbiAgICAgIGNvbnN0IHVybCA9IHNlbGVjdFVybFN0cmluZyhhcmdzWzBdKVxuICAgICAgYXJnc1swXSA9IHVybFxuXG4gICAgICBjb25zdCByZXF1ZXN0Qm9keSA9IGFyZ3NbMV0gfHwgbnVsbFxuXG4gICAgICBjb25zdCBzdGFydFRpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICBjb25zdCBlbmRwb2ludCA9ICh1cmwgfHwgJycpLnJlcGxhY2UoaG9zdFVybCwgJycpXG5cbiAgICAgIGNvbnN0IGlzRGVtb0hvc3QgPSBkZW1vVXJsID8gZW5hYmxlRGVtbyAmJiAoKHVybCB8fCAnJykuaW5kZXhPZihkZW1vVXJsKSA9PT0gMCkgOiBmYWxzZVxuICAgICAgY29uc3QgcmVxdWVzdCA9IGlzRGVtb0hvc3QgPyBmYWtlUmVxdWVzdCA6IHJlYWxSZXF1ZXN0XG5cbiAgICAgIGxvZyhcbiAgICAgICAgSU5GTyxcbiAgICAgICAgYOKktSAlY1stLS1dICR7bWV0aG9kfSAlYyR7ZW5kcG9pbnR9YCxcbiAgICAgICAgJ2NvbG9yOiM5OTk7JywgJ2NvbG9yOmJsYWNrOycsXG4gICAgICAgIHtcbiAgICAgICAgICAuLi4obG9nZ2luZ1JlcXVlc3QgPyB7cmVxdWVzdDogcmVxdWVzdEJvZHl9IDoge30pXG4gICAgICAgIH1cbiAgICAgIClcblxuICAgICAgLy8gUkVRVUVTVCEgJEZsb3dJZ25vcmVcbiAgICAgIHJldHVybiByZXF1ZXN0KC4uLmFyZ3MpXG5cbiAgICAgICAgLy8gQUZURVIgUkVRVUVTVFxuICAgICAgICAuY2F0Y2gocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gZW5kVGltZSAtIHN0YXJ0VGltZVxuXG4gICAgICAgICAgbGV0IHN0YXR1cyA9IG51bGxcbiAgICAgICAgICBsZXQgYm9keSA9IG51bGxcblxuICAgICAgICAgIC8vIGlmIGVycm9yIGlzIGEgTmV0d29yayBlcnJvciB1c2Ugb2JqZWN0IGRhdGFcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzIHx8IHN0YXR1c1xuICAgICAgICAgICAgYm9keSA9IHJlc3BvbnNlLmJvZHkgfHwgYm9keVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxvZyhcbiAgICAgICAgICAgIElORk8sXG4gICAgICAgICAgICBg4qS0ICVjWyR7c3RhdHVzIHx8ICchISEnfV0gJHttZXRob2R9ICVjJHtlbmRwb2ludH0gKCR7ZGVsdGFUaW1lfW1zKWAsXG4gICAgICAgICAgICBgY29sb3I6JHtzZWxlY3RTdGF0dXNDb2xvcihzdGF0dXMpfWAsICdjb2xvcjpibGFjazsnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAuLi4obG9nZ2luZ1JlcXVlc3QgPyB7cmVxdWVzdDogcmVxdWVzdEJvZHl9IDoge30pLFxuICAgICAgICAgICAgICAuLi4obG9nZ2luZ1Jlc3BvbnNlID8ge3Jlc3BvbnNlOiBib2R5fSA6IHt9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcblxuICAgICAgICAgIG9wdGlvbnMub25SZXNwb25zZSAmJiBvcHRpb25zLm9uUmVzcG9uc2Uoc3RhdHVzLCBib2R5LCByZXNwb25zZSlcblxuICAgICAgICAgIC8vIFJhaXNlIGFuIGFjdHVhbCBlcnJvclxuICAgICAgICAgIHRocm93IHJlc3BvbnNlXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBjb25zdCBlbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICAgIGNvbnN0IGRlbHRhVGltZSA9IGVuZFRpbWUgLSBzdGFydFRpbWVcblxuICAgICAgICAgIGNvbnN0IHsgc3RhdHVzLCBib2R5IH0gPSByZXNwb25zZVxuXG4gICAgICAgICAgbG9nKFxuICAgICAgICAgICAgSU5GTyxcbiAgICAgICAgICAgIGDipLQgJWNbJHtzdGF0dXN9XSAke21ldGhvZH0gJWMke2VuZHBvaW50fSAoJHtkZWx0YVRpbWV9bXMpICVjJHtpc0RlbW9Ib3N0ID8gJ1tkZW1vXScgOiAnJ31gLFxuICAgICAgICAgICAgYGNvbG9yOiR7c2VsZWN0U3RhdHVzQ29sb3Ioc3RhdHVzKX1gLCAnY29sb3I6YmxhY2s7JywgJ2NvbG9yOmJsdWU7JyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgLi4uKGxvZ2dpbmdSZXF1ZXN0ID8ge3JlcXVlc3Q6IHJlcXVlc3RCb2R5fSA6IHt9KSxcbiAgICAgICAgICAgICAgLi4uKGxvZ2dpbmdSZXNwb25zZSA/IHtyZXNwb25zZTogYm9keX0gOiB7fSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG5cbiAgICAgICAgICBvcHRpb25zLm9uUmVzcG9uc2UgJiYgb3B0aW9ucy5vblJlc3BvbnNlKHN0YXR1cywgYm9keSwgcmVzcG9uc2UpXG5cbiAgICAgICAgICByZXR1cm4gYm9keVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYXBpLFxuICAgIHJlcXVlc3RGYWN0b3J5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV0d29ya0ZhY3RvcnlcbiJdfQ==