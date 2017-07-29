
// @flow

import Promise from 'bluebird'
import SafeUrlAssembler from 'safe-url-assembler'

import { fetchFactory, resolveResponse, MIMETYPE_JSON } from './fetchFactory'
import { fetchReduxFactory } from './fetchReduxFactory'
import { selectUrlString } from './selectors'

/*
  logFactory:
    returns a console.info wrapper that respects @show.
*/

const INFO = 'info'
const ERROR = 'error'

const logFactory = (show: boolean = false) => {
  return (type: string, ...args: Array<mixed>) => {
    return show ? console[type](...args) : null
  }
}

/*
  fakeFactory:
    helper function to networkFactory. returns a promise that passed url part to
    resolver function that then returns an Object that mocks data from an API.
*/

const fakeFactory = (
  rootUrl: string,
  resolver?: Function = () => null
) => {
  return (
    token: string|null,
    url: string,
    body?: Object|string|null = null,
    file?: Object|null = null,
    options?: Object = {},
    headers?: Object = {}
  ) => {
    return new Promise(resolve => {
      const endpoint = (url || '').replace(rootUrl, '')
      const data = (resolver && resolver(endpoint)) || null
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': MIMETYPE_JSON }
      })
      return resolve(resolveResponse(response))
    })
  }
}

/*
  networkFactory:
    helper that takes @config object and @resolver function for data testing.
    @useRedux controls whether or not to use the getToken alternative for auth.
*/

const errorTypes = ['NetworkError', 'JSONParseError', 'TypeError']

export const networkFactory = (
  config: Object,
  resolver?: Function = null,
  useRedux?: Boolean = true
) => {
  const { apiHostUrl, apiDemoUrl, dev, logging } = config
  const log = logFactory(logging)

  log(INFO, `✅ API: ${apiHostUrl}`)
  const api = SafeUrlAssembler(apiHostUrl)

  const factory = useRedux ? fetchReduxFactory : fetchFactory

  const requestFactory = (
    method: string,
    notify: Function = null,
    getToken: Function = () => null
  ) => {
    const realRequest = factory(method, notify, getToken)
    const fakeRequest = fakeFactory(apiHostUrl, resolver)

    return (
      token: string|null,
      url: string,
      body?: Object|string|null = undefined,
      file?: Object|null = undefined,
      options?: Object = {},
      headers?: Object = {}
    ) => {
      // BEFORE REQUEST
      url = selectUrlString(url)

      const startTime = (new Date()).getTime()
      const endpoint = (url || '').replace(apiHostUrl, '')

      const isDemoHost = dev && ((url || '').indexOf(apiDemoUrl) === 0)
      const request = isDemoHost ? fakeRequest : realRequest

      log(
        INFO,
        `⤵ %c[---] ${method} %c${endpoint}`,
        'color:#999;', 'color:black;'
      )

      // REQUEST!
      return request(token, url, body, file, options, headers)

        // AFTER REQUEST
        .catch(err => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime
          const isRequestError = errorTypes.indexOf(err.name) > -1

          let _status = '!!!'
          let _response = null

          // if raised error is a Network or JSONParse error use object data
          if (isRequestError) {
            const { status, body } = err
            _status = status
            _response = body
          }

          log(
            ERROR,
            `⤴ %c[!!!] ${method} %c${endpoint} (${deltaTime}ms)`,
            'color:#D36B25;', 'color:black;',
            {response: body, error: err}
          )

          // Raise an actual error
          if (isRequestError) {
            throw err
          }
        })
        .then(response => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          const { status, body } = response

          log(
            INFO,
            `⤴ %c[${status}] ${method} %c${endpoint} (${deltaTime}ms) %c${isDemoHost ? '[demo]' : ''}`,
            'color:#D36B25;', 'color:black;', 'color:blue;',
            {response: body}
          )

          return body
        })
    }
  }

  return {api, requestFactory}
}

export default networkFactory
