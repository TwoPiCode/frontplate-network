
// @flow

import Promise from 'bluebird'
import SafeUrlAssembler from 'safe-url-assembler'

import { fetchFactory, resolveResponse, MIMETYPE_JSON } from './fetchFactory'
import { fetchReduxFactory } from './fetchReduxFactory'
import { selectUrlString, selectStatusColor } from './selectors'
import { NetworkError, JSONParseError } from './errors'

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
    getToken: Function = null
  ) => {
    const realRequest = factory(method, getToken)
    const fakeRequest = fakeFactory(apiHostUrl, resolver)

    return (
      ...args
    ) => {
      // BEFORE REQUEST
      const url = selectUrlString(args[1])
      args[1] = url

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
      return request(...args)

        // AFTER REQUEST
        .catch(err => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          let status = '!!!'
          let body = null

          // if error is a Network error use object data
          if (err instanceof NetworkError) {
            status = err.status || status
            body = err.body || body
          }

          const color = selectStatusColor(status)

          log(
            INFO,
            `⤴ %c[${status}] ${method} %c${endpoint} (${deltaTime}ms)`,
            `color:${color}`, 'color:black;',
            {response: (body && body.error ? body.error : body)}
          )

          // Raise an actual error
          throw err
        })
        .then(res => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          const { status, body } = res
          const color = selectStatusColor(status)

          log(
            INFO,
            `⤴ %c[${status}] ${method} %c${endpoint} (${deltaTime}ms) %c${isDemoHost ? '[demo]' : ''}`,
            `color:${color}`, 'color:black;', 'color:blue;',
            {response: body}
          )

          return body
        })
    }
  }

  return {api, requestFactory}
}

export default networkFactory
