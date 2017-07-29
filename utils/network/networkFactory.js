
// @flow

import { fetchFactory } from './fetchFactory'
import { fetchReduxFactory } from './fetchReduxFactory'

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
    return new Promise((resolve, reject) => {
      const endpoint = (url || '').replace(rootUrl, '')
      const response = resolver && resolver(endpoint)
      if (response) {
        return resolve(response)
      } else {
        return reject(response)
      }
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
  const { apiHostUrl, apiDemoUrl, dev } = config
  const log = logFactory(dev)

  log(INFO, `✅ API: ${apiHostUrl}`)
  const api = SafeUrlAssembler(apiHostUrl)

  const factory = useRedux ? fetchReduxFactory : fetchFactory

  const requestFactory = (
    method: string,
    notify: Function = null,
    getToken: Function = () => null
  ) => {
    const realRequest = factory(method, notify, getToken)
    const fakeRequest = fakeFactory(apiHostUrl)

    return (
      token: string|null,
      url: string,
      body?: Object|string|null = null,
      file?: Object|null = null,
      options?: Object = {},
      headers?: Object = {}
    ) => {
      // BEFORE REQUEST
      const startTime = (new Date()).getTime()
      const endpoint = (url || '').replace(apiHostUrl, '')

      const isDemoHost = ((url || '').indexOf(apiDemoHost) === 0)
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

          // check if raised error is a Network or JSONParse error
          if (errorTypes.indexOf(err.name) > -1) {
            return err
          } else {
            log(
              ERROR,
              `⤴ %c[---] ${method} %c${endpoint} (${deltaTime}ms)`,
              'color:#D36B25;', 'color:black;',
              {error: err}
            )
          }
        })
        .then(response => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          const { name, status, body } = response

          let _status = 200
          let _response = null

          // pull status and build response from response if Non200Error
          if (name === 'TypeError') {
            _status = '!!!'
          } else if (errorTypes.indexOf(name) > -1) {
            _status = status
            _response = body
          } else {
            _response = response
          }

          // Needs to be outside the if statement so errors are bobbled
          // up in staging and production so they can be handled
          if (errorTypes.indexOf(name) > -1){
            throw response
          }

          log(
            INFO,
            `⤴ %c[${_status}] ${method} %c${endpoint} (${deltaTime}ms) %c${isDemoHost ? '[demo]' : ''}`,
            'color:#D36B25;', 'color:black;', 'color:blue;',
            {response: body}
          )

          return response
        })
    }

  return {api, requestFactory}
}

export default networkFactory
