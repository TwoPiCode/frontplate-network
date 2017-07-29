
// @flow

// require('fetch-everywhere')
import Promise from 'bluebird'
import SafeUrlAssembler from 'safe-url-assembler'

import { NetworkError, JSONParseError } from './errors'

export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const DELETE = 'DELETE'

const MIMETYPE_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded'
const MIMETYPE_JSON = 'application/json'

const UNEXPECTED_RESPONSE = 'Received unexpected response from the server.'

/*
  fetchFactory:
    network helper that takes:
      @method: a http request method like 'GET', 'POST', 'DELETE' etc.
      @notify?: a function that takes a string to report on a network error.
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

export const fetchFactory = (
  method: string,
  notify: Function = null
) => {
  return (
    token: string|null,
    url: string,
    body?: Object|string|null = null,
    file?: Object|null = null,
    options?: Object = {},
    headers?: Object = {}
  ) => {
    let _url = url
    let _body = body
    let _headers = {}

    /*
      Resolve @url if raw Object from safe-url-assembler.
    */

    _url = url.toString ? url.toString() : url

    /*
      Adding a @file will set method to `POST`.
    */

    if (file) {
      method = POST
    }

    /*
      Adding a @file + @body with FormData, or JSON serialise @body.
    */

    if (file) {
      _body = new FormData()

      // add the file
      _body.append('file', file)

      // add all key:values from body object
      if (typeof body === 'object') {
        Object.keys(body).map(key => _body.append(key, body[key]))
      }
    } else {
      // serialise body if given as object
      _body = typeof body === 'object' ? JSON.stringify(body) : body
    }

    /*
      Adding Content-Type header if method is GET.
    */

    if (method === GET) {
      _headers['Content-Type'] = MIMETYPE_X_WWW_FORM_URLENCODED
    } else if (!file) {
      _headers['Content-Type'] = MIMETYPE_JSON
    }

    /*
      Adding Authorization header from @token.
    */

    if (token) {
      _headers['Authorization'] = token
    }

    /*
      Do request.
    */

    return fetch(url, {
      method: method,
      body: _body,
      headers: {..._headers, ...headers},
      ...options
    }).then(response => {
      const { status, headers } = response

      const isJson = headers.get('Content-Type') === MIMETYPE_JSON
      const asJson = options['json'] === false

      /*
        Raise error if non-successful response.
      */

      const checkStatus = (data: any) => {
        if (status < 200 || status >= 300) {
          notify && notify(UNEXPECTED_RESPONSE)
          throw new NetworkError(status, data)
        }
      }

      const resolveJson = () => {
        return response.json()
          .then(json => {
            return checkStatus(json)
            Promise.resolve(json)
          })
          .catch(() => {
            notify && notify(UNEXPECTED_RESPONSE)
            throw new JSONParseError(status)
          })
      }

      const resolveText = () => {
        return response.text()
          .then(text => {
            return checkStatus(text)
            Promise.resolve(text)
          })
          .catch(err => {
            notify && notify(UNEXPECTED_RESPONSE)
            throw err
          })
      }

      if (asJson) {
        return resolveJson()
      } else {
        if (isJson) {
          return resolveJson()
        } else {
          return resolveText()
        }
      }
    })
  }
}

export default fetchFactory
