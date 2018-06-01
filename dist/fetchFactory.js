'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchFactory = exports.resolveResponse = exports.MIMETYPE_JSON = exports.MIMETYPE_FORMDATA = exports.PATCH = exports.DELETE = exports.PUT = exports.POST = exports.GET = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _errors = require('./errors');

var _selectors = require('./selectors');

var GET = exports.GET = 'GET';
var POST = exports.POST = 'POST';
var PUT = exports.PUT = 'PUT';
var DELETE = exports.DELETE = 'DELETE';
var PATCH = exports.PATCH = 'PATCH';

var MIMETYPE_FORMDATA = exports.MIMETYPE_FORMDATA = 'multipart/form-data';
var MIMETYPE_JSON = exports.MIMETYPE_JSON = 'application/json';

/*
  checkStatus, resolveJson, resolveText:
    helper functions for resolveResponse.
*/

var checkStatus = function checkStatus(status, data) {
  if (!(status >= 200 && status < 400)) {
    throw new _errors.NetworkError(status, data);
  }
};

var resolveJson = function resolveJson(response) {
  var status = response.status;

  return response.json().then(function (data) {
    checkStatus(status, data);
    return data;
  }).catch(function (error) {
    if (error instanceof _errors.NetworkError) {
      throw error;
    }
    throw new _errors.JSONParseError(status);
  });
};

var resolveText = function resolveText(response) {
  var status = response.status;

  return response.text().then(function (data) {
    checkStatus(status, data);
    return data;
  }).catch(function (err) {
    throw err;
  });
};

/*
  resolveResponse:
    returns processed data form for response object's body data.
*/

var resolveResponse = exports.resolveResponse = function resolveResponse(response, asJson) {
  var status = response.status,
      headers = response.headers;

  var isJson = (headers.get('Content-Type') || '').indexOf(MIMETYPE_JSON) > -1;
  return new Promise(function (resolve, reject) {
    // if no response
    if (!response) {
      return reject({ body: null, status: null, response: response });
    }
    // if NO_CONTENT status code
    if (status === 204) {
      return resolve({ body: null, status: status, response: response });
    }
    // resolve the content
    var resolveContent = asJson || isJson ? resolveJson : resolveText;
    resolveContent(response).then(function (body) {
      return resolve({ body: body, status: status, response: response });
    }).catch(function (error) {
      return reject(error);
    });
  });
};

/*
  fetchFactory:
    network helper that takes:
      @method: a http request method like 'GET', 'POST', 'DELETE' etc.
    returns a function that takes:
      @token: if !token Authorization header is not added.
      @url: target of the request.
      @body?: can be Object, JSON string, or nothing.
      @file?: if !file body is added into FormData Object with @file, request is
        forced into POST method, and Content-Type is handled automatically.
      @options?: directly override anything given to fetch itself with an Object.
        passing { json: false } will assume response is plain text.
      @headers?: define your own headers and override generated ones.
*/

var fetchFactory = exports.fetchFactory = function fetchFactory(method) {
  var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function (url, body) {
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var request = {
      url: url,
      body: body,
      headers: _extends({}, headers)
    };

    var _options$json = options.json,
        optionAsJson = _options$json === undefined ? false : _options$json,
        _options$formdata = options.formdata,
        optionFormData = _options$formdata === undefined ? false : _options$formdata;

    // Resolve @url if raw Object from safe-url-assembler.

    request.url = (0, _selectors.selectUrlString)(request.url);

    // Serialise body if given as object,
    request.body = (0, _selectors.selectBodyJSON)(request.body);

    // Using formdata (e.g. in case of file upload).
    if (optionFormData) {
      request.body = new FormData();
      if (body !== null && (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object') {
        Object.keys(body).map(function (key) {
          return request.body.append(key, body[key]);
        });
      }
    }

    // Adding Content-Type headers.
    if (method === GET) {
      delete request.headers['Content-Type'];
    } else if (optionFormData) {
      request.headers['Content-Type'] = MIMETYPE_FORMDATA;
    } else {
      request.headers['Content-Type'] = MIMETYPE_JSON;
    }

    // Allow external modification of the request before fetch.
    if (_options.mutateRequest) {
      request = _options.mutateRequest(request);
    }

    return new Promise(function (resolve, reject) {
      Promise.resolve(request).then(function () {
        var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return fetch(request.url, _extends({
          method: method,
          body: request.body,
          headers: request.headers
        }, request.options || {})).then(function (response) {
          return resolveResponse(response, optionAsJson).then(response.ok ? resolve : reject).catch(reject);
        });
      }).catch(function (error) {
        return reject(error);
      });
    });
  };
};

exports.default = fetchFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mZXRjaEZhY3RvcnkuanMiXSwibmFtZXMiOlsiR0VUIiwiUE9TVCIsIlBVVCIsIkRFTEVURSIsIlBBVENIIiwiTUlNRVRZUEVfRk9STURBVEEiLCJNSU1FVFlQRV9KU09OIiwiY2hlY2tTdGF0dXMiLCJzdGF0dXMiLCJkYXRhIiwicmVzb2x2ZUpzb24iLCJyZXNwb25zZSIsImpzb24iLCJ0aGVuIiwiY2F0Y2giLCJlcnJvciIsInJlc29sdmVUZXh0IiwidGV4dCIsImVyciIsInJlc29sdmVSZXNwb25zZSIsImFzSnNvbiIsImhlYWRlcnMiLCJpc0pzb24iLCJnZXQiLCJpbmRleE9mIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJib2R5IiwicmVzb2x2ZUNvbnRlbnQiLCJmZXRjaEZhY3RvcnkiLCJtZXRob2QiLCJfb3B0aW9ucyIsInVybCIsIm9wdGlvbnMiLCJyZXF1ZXN0Iiwib3B0aW9uQXNKc29uIiwiZm9ybWRhdGEiLCJvcHRpb25Gb3JtRGF0YSIsIkZvcm1EYXRhIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImFwcGVuZCIsImtleSIsIm11dGF0ZVJlcXVlc3QiLCJmZXRjaCIsIm9rIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUdBOztBQUNBOztBQUVPLElBQU1BLG9CQUFNLEtBQVo7QUFDQSxJQUFNQyxzQkFBTyxNQUFiO0FBQ0EsSUFBTUMsb0JBQU0sS0FBWjtBQUNBLElBQU1DLDBCQUFTLFFBQWY7QUFDQSxJQUFNQyx3QkFBUSxPQUFkOztBQUVBLElBQU1DLGdEQUNYLHFCQURLO0FBRUEsSUFBTUMsd0NBQ1gsa0JBREs7O0FBR1A7Ozs7O0FBS0EsSUFBTUMsY0FBYyxTQUFkQSxXQUFjLENBQUNDLE1BQUQsRUFBaUJDLElBQWpCLEVBQStCO0FBQ2pELE1BQUksRUFBRUQsVUFBVSxHQUFWLElBQWlCQSxTQUFTLEdBQTVCLENBQUosRUFBc0M7QUFDcEMsVUFBTSx5QkFBaUJBLE1BQWpCLEVBQXlCQyxJQUF6QixDQUFOO0FB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QUFSLElBQW1CLEVBSkQsR0FLckJyQixJQUxxQixDQUtoQixvQkFBWTtBQUNsQixpQkFBT00sZ0JBQWdCUixRQUFoQixFQUEwQnlCLFlBQTFCLEVBQ0p2QixJQURJLENBQ0NGLFNBQVNvQyxFQUFULEdBQWNyQixPQUFkLEdBQXdCQyxNQUR6QixFQUVKYixLQUZJLENBRUVhLE1BRkYsQ0FBUDtBQUdELFNBVHVCLENBQWxCO0FBQUEsT0FEUixFQVdHYixLQVhILENBV1MsaUJBQVM7QUFDZCxlQUFPYSxPQUFPWixLQUFQLENBQVA7QUFDRCxPQWJIO0FBY0QsS0FmTSxDQUFQO0FBZ0JELEdBOUREO0FBK0RELENBbkVNOztrQkFxRVFlLFkiLCJmaWxlIjoiZmV0Y2hGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuXG5pbXBvcnQgeyBOZXR3b3JrRXJyb3IsIEpTT05QYXJzZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnXG5pbXBvcnQgeyBzZWxlY3RVcmxTdHJpbmcsIHNlbGVjdEJvZHlKU09OIH0gZnJvbSAnLi9zZWxlY3RvcnMnXG5cbmV4cG9ydCBjb25zdCBHRVQgPSAnR0VUJ1xuZXhwb3J0IGNvbnN0IFBPU1QgPSAnUE9TVCdcbmV4cG9ydCBjb25zdCBQVVQgPSAnUFVUJ1xuZXhwb3J0IGNvbnN0IERFTEVURSA9ICdERUxFVEUnXG5leHBvcnQgY29uc3QgUEFUQ0ggPSAnUEFUQ0gnXG5cbmV4cG9ydCBjb25zdCBNSU1FVFlQRV9GT1JNREFUQSA9IChcbiAgJ211bHRpcGFydC9mb3JtLWRhdGEnKVxuZXhwb3J0IGNvbnN0IE1JTUVUWVBFX0pTT04gPSAoXG4gICdhcHBsaWNhdGlvbi9qc29uJylcblxuLypcbiAgY2hlY2tTdGF0dXMsIHJlc29sdmVKc29uLCByZXNvbHZlVGV4dDpcbiAgICBoZWxwZXIgZnVuY3Rpb25zIGZvciByZXNvbHZlUmVzcG9uc2UuXG4qL1xuXG5jb25zdCBjaGVja1N0YXR1cyA9IChzdGF0dXM6IG51bWJlciwgZGF0YTogYW55KSA9PiB7XG4gIGlmICghKHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgNDAwKSkge1xuICAgIHRocm93IG5ldyBOZXR3b3JrRXJyb3Ioc3RhdHVzLCBkYXRhKVxuICB9XG59XG5cbmNvbnN0IHJlc29sdmVKc29uID0gKHJlc3BvbnNlOiBPYmplY3QpID0+IHtcbiAgY29uc3QgeyBzdGF0dXMgfSA9IHJlc3BvbnNlXG4gIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIGNoZWNrU3RhdHVzKHN0YXR1cywgZGF0YSlcbiAgICAgIHJldHVybiBkYXRhXG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBOZXR3b3JrRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBKU09OUGFyc2VFcnJvcihzdGF0dXMpXG4gICAgfSlcbn1cblxuY29uc3QgcmVzb2x2ZVRleHQgPSAocmVzcG9uc2U6IE9iamVjdCkgPT4ge1xuICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2VcbiAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgY2hlY2tTdGF0dXMoc3RhdHVzLCBkYXRhKVxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfSlcbn1cblxuLypcbiAgcmVzb2x2ZVJlc3BvbnNlOlxuICAgIHJldHVybnMgcHJvY2Vzc2VkIGRhdGEgZm9ybSBmb3IgcmVzcG9uc2Ugb2JqZWN0J3MgYm9keSBkYXRhLlxuKi9cblxuZXhwb3J0IGNvbnN0IHJlc29sdmVSZXNwb25zZSA9IChyZXNwb25zZTogT2JqZWN0LCBhc0pzb24/OiBib29sZWFuKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgY29uc3Qge3N0YXR1cywgaGVhZGVyc30gPSByZXNwb25zZVxuICBjb25zdCBpc0pzb24gPSAoaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICcnKS5pbmRleE9mKE1JTUVUWVBFX0pTT04pID4gLTFcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBpZiBubyByZXNwb25zZVxuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZWplY3Qoe2JvZHk6IG51bGwsIHN0YXR1czogbnVsbCwgcmVzcG9uc2V9KVxuICAgIH1cbiAgICAvLyBpZiBOT19DT05URU5UIHN0YXR1cyBjb2RlXG4gICAgaWYgKHN0YXR1cyA9PT0gMjA0KSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh7Ym9keTogbnVsbCwgc3RhdHVzLCByZXNwb25zZX0pXG4gICAgfVxuICAgIC8vIHJlc29sdmUgdGhlIGNvbnRlbnRcbiAgICBjb25zdCByZXNvbHZlQ29udGVudCA9IChhc0pzb24gfHwgaXNKc29uKSA/IHJlc29sdmVKc29uIDogcmVzb2x2ZVRleHRcbiAgICByZXNvbHZlQ29udGVudChyZXNwb25zZSkudGhlbigoYm9keSA9PiB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh7Ym9keSwgc3RhdHVzLCByZXNwb25zZX0pXG4gICAgfSkpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgfSlcbn1cblxuLypcbiAgZmV0Y2hGYWN0b3J5OlxuICAgIG5ldHdvcmsgaGVscGVyIHRoYXQgdGFrZXM6XG4gICAgICBAbWV0aG9kOiBhIGh0dHAgcmVxdWVzdCBtZXRob2QgbGlrZSAnR0VUJywgJ1BPU1QnLCAnREVMRVRFJyBldGMuXG4gICAgcmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXM6XG4gICAgICBAdG9rZW46IGlmICF0b2tlbiBBdXRob3JpemF0aW9uIGhlYWRlciBpcyBub3QgYWRkZWQuXG4gICAgICBAdXJsOiB0YXJnZXQgb2YgdGhlIHJlcXVlc3QuXG4gICAgICBAYm9keT86IGNhbiBiZSBPYmplY3QsIEpTT04gc3RyaW5nLCBvciBub3RoaW5nLlxuICAgICAgQGZpbGU/OiBpZiAhZmlsZSBib2R5IGlzIGFkZGVkIGludG8gRm9ybURhdGEgT2JqZWN0IHdpdGggQGZpbGUsIHJlcXVlc3QgaXNcbiAgICAgICAgZm9yY2VkIGludG8gUE9TVCBtZXRob2QsIGFuZCBDb250ZW50LVR5cGUgaXMgaGFuZGxlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAgQG9wdGlvbnM/OiBkaXJlY3RseSBvdmVycmlkZSBhbnl0aGluZyBnaXZlbiB0byBmZXRjaCBpdHNlbGYgd2l0aCBhbiBPYmplY3QuXG4gICAgICAgIHBhc3NpbmcgeyBqc29uOiBmYWxzZSB9IHdpbGwgYXNzdW1lIHJlc3BvbnNlIGlzIHBsYWluIHRleHQuXG4gICAgICBAaGVhZGVycz86IGRlZmluZSB5b3VyIG93biBoZWFkZXJzIGFuZCBvdmVycmlkZSBnZW5lcmF0ZWQgb25lcy5cbiovXG5cbmV4cG9ydCBjb25zdCBmZXRjaEZhY3RvcnkgPSAoXG4gIG1ldGhvZDogc3RyaW5nLFxuICBfb3B0aW9uczogT2JqZWN0ID0ge31cbikgPT4ge1xuICByZXR1cm4gKFxuICAgIHVybDogc3RyaW5nLFxuICAgIGJvZHk/OiBPYmplY3R8c3RyaW5nfG51bGwsXG4gICAgaGVhZGVycz86IE9iamVjdCA9IHt9LFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbiAgKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgIHVybCxcbiAgICAgIGJvZHksXG4gICAgICBoZWFkZXJzOiB7Li4uaGVhZGVyc31cbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBqc29uOiBvcHRpb25Bc0pzb24gPSBmYWxzZSxcbiAgICAgIGZvcm1kYXRhOiBvcHRpb25Gb3JtRGF0YSA9IGZhbHNlXG4gICAgfSA9IG9wdGlvbnNcblxuICAgIC8vIFJlc29sdmUgQHVybCBpZiByYXcgT2JqZWN0IGZyb20gc2FmZS11cmwtYXNzZW1ibGVyLlxuICAgIHJlcXVlc3QudXJsID0gc2VsZWN0VXJsU3RyaW5nKHJlcXVlc3QudXJsKVxuXG4gICAgLy8gU2VyaWFsaXNlIGJvZHkgaWYgZ2l2ZW4gYXMgb2JqZWN0LFxuICAgIHJlcXVlc3QuYm9keSA9IHNlbGVjdEJvZHlKU09OKHJlcXVlc3QuYm9keSlcblxuICAgIC8vIFVzaW5nIGZvcm1kYXRhIChlLmcuIGluIGNhc2Ugb2YgZmlsZSB1cGxvYWQpLlxuICAgIGlmIChvcHRpb25Gb3JtRGF0YSkge1xuICAgICAgcmVxdWVzdC5ib2R5ID0gbmV3IEZvcm1EYXRhKClcbiAgICAgIGlmIChib2R5ICE9PSBudWxsICYmIHR5cGVvZiBib2R5ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBPYmplY3Qua2V5cyhib2R5KS5tYXAoa2V5ID0+IHJlcXVlc3QuYm9keS5hcHBlbmQoa2V5LCBib2R5W2tleV0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZGluZyBDb250ZW50LVR5cGUgaGVhZGVycy5cbiAgICBpZiAobWV0aG9kID09PSBHRVQpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddXG4gICAgfSBlbHNlIGlmIChvcHRpb25Gb3JtRGF0YSkge1xuICAgICAgcmVxdWVzdC5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IE1JTUVUWVBFX0ZPUk1EQVRBXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBNSU1FVFlQRV9KU09OXG4gICAgfVxuXG5cbiAgICAvLyBBbGxvdyBleHRlcm5hbCBtb2RpZmljYXRpb24gb2YgdGhlIHJlcXVlc3QgYmVmb3JlIGZldGNoLlxuICAgIGlmIChfb3B0aW9ucy5tdXRhdGVSZXF1ZXN0KSB7XG4gICAgICByZXF1ZXN0ID0gX29wdGlvbnMubXV0YXRlUmVxdWVzdChyZXF1ZXN0KVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBQcm9taXNlLnJlc29sdmUocmVxdWVzdClcbiAgICAgICAgLnRoZW4oKHJlcXVlc3QgPSB7fSkgPT4gZmV0Y2gocmVxdWVzdC51cmwsIHtcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICBib2R5OiByZXF1ZXN0LmJvZHksXG4gICAgICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLFxuICAgICAgICAgIC4uLihyZXF1ZXN0Lm9wdGlvbnMgfHwge30pXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlUmVzcG9uc2UocmVzcG9uc2UsIG9wdGlvbkFzSnNvbilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlLm9rID8gcmVzb2x2ZSA6IHJlamVjdClcbiAgICAgICAgICAgIC5jYXRjaChyZWplY3QpXG4gICAgICAgIH0pKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmZXRjaEZhY3RvcnlcbiJdfQ==