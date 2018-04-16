
// @flow

import { NetworkError, JSONParseError } from './errors'
import { selectUrlString, selectBodyJSON } from './selectors'

export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const DELETE = 'DELETE'
export const PATCH = 'PATCH'

export const MIMETYPE_FORMDATA = (
  'multipart/form-data')
export const MIMETYPE_JSON = (
  'application/json')

/*
  checkStatus, resolveJson, resolveText:
    helper functions for resolveResponse.
*/

const checkStatus = (status: number, data: any) => {
  if (!(status >= 200 && status < 400)) {
    throw new NetworkError(status, data)
  }
}

const resolveJson = (response: Object) => {
  const { status } = response
  return response.json()
    .then(data => {
      checkStatus(status, data)
      return data
    }).catch(() => {
      throw new JSONParseError(status)
    })
}

const resolveText = (response: Object) => {
  const { status } = response
  return response.text()
    .then(data => {
      checkStatus(status, data)
      return data
    }).catch(err => {
      throw err
    })
}

/*
  resolveResponse:
    returns processed data form for response object's body data.
*/

export const resolveResponse = (response: Object, asJson: boolean) => {
  const {status, headers} = response
  const isJson = (headers.get('Content-Type') || '').indexOf(MIMETYPE_JSON) > -1
  return new Promise((resolve, reject) => {
    // if no response
    if (!response) {
      return reject({body: null, status: null, response})
    }
    // if NO_CONTENT status code
    if (status === 204) {
      return resolve({body: null, status, response})
    }
    // resolve the content
    const resolveContent = (asJson || isJson) ? resolveJson : resolveText
    resolveContent(response).then((body => {
      return resolve({body, status, response})
    })).catch(error => {
      return reject(error)
    })
  })
}

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

export const fetchFactory = (
  method: string,
  mutateRequest: Function = (request) => request
) => {
  return (
    url: string,
    body?: Object|string|null,
    headers?: Object = {},
    options?: Object = {},
  ) => {
    const _request = {
      url,
      body,
      headers: {...headers}
    }

    const {
      json: optionAsJson = false,
      formdata: optionFormData = false
    } = options

    // Resolve @url if raw Object from safe-url-assembler.
    _request.url = selectUrlString(_request.url)

    // Serialise body if given as object,
    _request.body = selectBodyJSON(_request.body)

    // Using formdata (e.g. in case of file upload).
    if (optionFormData) {
      _request.body = new FormData()
      if (typeof body === 'object') {
        Object.keys(body).map(key => _request.body.append(key, body[key]))
      }
    }

    // Adding Content-Type headers.
    if (method === GET) {
      delete _request.headers['Content-Type']
    } else if (optionFormData) {
      _request.headers['Content-Type'] = MIMETYPE_FORMDATA
    } else {
      _request.headers['Content-Type'] = MIMETYPE_JSON
    }

    // Allow external modification of the request before fetch.
    const request = mutateRequest(_request)

    return new Promise((resolve, reject) => {
      fetch(request.url, {
        method: method,
        body: request.body,
        headers: request.headers,
        ...(request.options || {})
      }).then(response => {
        return resolveResponse(response, optionAsJson).then(response.ok ? resolve : reject).catch(reject)
      }).catch(error => {
        return reject(error)
      })
    })
  }
}

export default fetchFactory
