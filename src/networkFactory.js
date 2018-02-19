
// @flow

import SafeUrlAssembler from 'safe-url-assembler'

import { fetchFactory, resolveResponse } from './fetchFactory'
import { selectUrlString, selectStatusColor } from './selectors'
import { NetworkError } from './errors'

/*
  logFactory:
    returns a console.info wrapper that respects @show.
*/

const INFO = 'info'

const logFactory = (show: boolean = false) => {
  return (type: string, ...args: Array<mixed>) => {
    return show ? console[type](...args) : null // eslint-disable-line
  }
}

/*
  fakeFactory:
    helper function to networkFactory. returns a promise that passed url part to
    resolver function that then returns an Object that mocks data from an API.
*/

const fakeFetchFactory = (
  rootUrl: string,
  resolver?: Function|null = () => null
) => {
  return (
    url: string
  ) => {
    return new Promise(resolve => {
      const endpoint = (url || '').replace(rootUrl, '')
      const data = (resolver && resolver(endpoint)) || null
      const response = new Response(JSON.stringify(data), {
      })
      return resolve(resolveResponse(response))
    })
  }
}

/*
  networkFactory:
    helper that takes @config object and @resolver function for data testing,
    and @resolver that accepts a function that takes a url/endpoint to then
    return a predefined object to immitate a resolved resposne for offline
    testing.
*/

export const networkFactory = (
  config: Object = {},
  resolver?: Function|null = null,
) => {
  const {
    hostUrl,
    demoUrl,
    enableDemo = true,
    enableLogging = true,
    loggingHostInfo = true,
    loggingRequest = true,
    loggingResponse = true
  } = config

  const api = SafeUrlAssembler(hostUrl)
  const log = logFactory(enableLogging)

  if (loggingHostInfo) {
    log(INFO, `✅ API: ${hostUrl}`)
  }

  const requestFactory = (
    method: string,
    options?: Object = {}
  ) => {
    const {
      mutateRequest: optionMutateRequest,
      onResponse: optionOnResponse
    } = options

    const realRequest = fetchFactory(method, optionMutateRequest)
    const fakeRequest = fakeFetchFactory(hostUrl, resolver)

    return (
      ...args: Array<any>
    ) => {

      // BEFORE REQUEST
      const url = selectUrlString(args[0])
      args[0] = url

      const requestBody = args[1] || null

      const startTime = (new Date()).getTime()
      const endpoint = (url || '').replace(hostUrl, '')

      const isDemoHost = demoUrl ? enableDemo && ((url || '').indexOf(demoUrl) === 0) : false
      const request = isDemoHost ? fakeRequest : realRequest

      log(
        INFO,
        `⤵ %c[---] ${method} %c${endpoint}`,
        'color:#999;', 'color:black;',
        {
          ...(loggingRequest ? {request: requestBody} : {})
        }
      )

      // REQUEST! $FlowIgnore
      return request(...args)

        // AFTER REQUEST
        .catch(response => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          let status = null
          let body = null

          // if error is a Network error use object data
          if (response instanceof NetworkError) {
            status = response.status || status
            body = response.body || body
          }

          log(
            INFO,
            `⤴ %c[${status || '!!!'}] ${method} %c${endpoint} (${deltaTime}ms)`,
            `color:${selectStatusColor(status)}`, 'color:black;',
            {
              ...(loggingRequest ? {request: requestBody} : {}),
              ...(loggingResponse ? {response: body} : {})
            }
          )

          optionOnResponse && optionOnResponse(status, body, response)

          // Raise an actual error
          throw response
        })
        .then(response => {
          const endTime = (new Date()).getTime()
          const deltaTime = endTime - startTime

          const { status, body } = response

          log(
            INFO,
            `⤴ %c[${status}] ${method} %c${endpoint} (${deltaTime}ms) %c${isDemoHost ? '[demo]' : ''}`,
            `color:${selectStatusColor(status)}`, 'color:black;', 'color:blue;',
            {
              ...(loggingRequest ? {request: requestBody} : {}),
              ...(loggingResponse ? {response: body} : {})
            }
          )

          optionOnResponse && optionOnResponse(status, body, response)

          return body
        })
    }
  }

  return {
    api,
    requestFactory
  }
}

export default networkFactory
