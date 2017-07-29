
// @flow

// require('fetch-everywhere')
import Promise from 'bluebird'

import { NetworkError, JSONParseError } from './errors'
import { selectUrlString, selectBodyJSON } from './selectors'

export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const DELETE = 'DELETE'

export const MIMETYPE_X_WWW_FORM_URLENCODED = (
  'application/x-www-form-urlencoded')
export const MIMETYPE_JSON = (
  'application/json')

const UNEXPECTED_RESPONSE = 'Received unexpected response from the server.'

/*
  checkStatus, resolveJson, resolveText:
    helper functions for resolveResponse.
*/

const checkStatus = (status: number, data: any) => {
  if (status < 200 || status >= 300) {
    notify && notify(UNEXPECTED_RESPONSE)
    throw new NetworkError(status, data)
  }
}

const resolveJson = (response: Object, status: number) => {
  return response.json()
    .then(json => {
      checkStatus(json)
      return Promise.resolve({
        body: json,
        status: response.status
      })
    })
    .catch(() => {
      notify && notify(UNEXPECTED_RESPONSE)
      throw new JSONParseError(status)
    })
}

const resolveText = (response: Object, status: number) => {
  return response.text()
    .then(text => {
      checkStatus(text)
      return Promise.resolve({
        body: text,
        status: response.status
      })
    })
    .catch(err => {
      notify && notify(UNEXPECTED_RESPONSE)
      throw err
    })
}

/*
  resolveResponse:
    returns processed data form for response object's body data.
*/

export const resolveResponse = (response: Object, asJson: boolean) => {
  const { status, headers } = response

  const isJson = headers.get('Content-Type') === MIMETYPE_JSON


  /*
    Raise error if non-successful response.
  */

  if (asJson) {
    return resolveJson(response, status)
  } else {
    if (isJson) {
      return resolveJson(response, status)
    } else {
      return resolveText(response, status)
    }
  }
}

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
    body?: Object|string|null = undefined,
    file?: Object|null = undefined,
    options?: Object = {},
    headers?: Object = {}
  ) => {
    let _url = url
    let _body = body
    let _headers = {}

    /*
      Resolve @url if raw Object from safe-url-assembler.
    */

    _url = selectUrlString(url)

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
      _body = selectBodyJSON(body)
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

    const asJson = options['json'] === false

    return fetch(url, {
      method: method,
      body: _body,
      headers: {..._headers, ...headers},
      ...options
    }).then(response => {
      return resolveResponse(response, asJson)
    })
  }
}

export default fetchFactory