
// @flow

import { fetchFactory } from './network'

/*
  fetchReduxFactory:
    same signature at fetchFactory, only with added getToken function which is
    passed the redux store state and expects a token string to be returned.
*/

export const fetchReduxFactory = (
  method: string,
  notify: Function = null,
  getToken: Function = () => null
) => {
  const request = fetchFactory(method, notify)

  return (
    state: Object|Function,
    url: string,
    body?: Object|string = undefined,
    file?: Object = undefined,
    options?: Object = {},
    headers?: Object = {}
  ) => {
    let _state = state

    /*
      Resolve state if still function.
    */

    _state = typeof state === 'function' ? state() : state

    /*
      Resolve token from state if @getToken.
    */

    const token = (getToken && getToken(state)) || null

    /*
      Do request.
    */

    return request(token, url, body, file, options, headers)
  }
}

export default fetchReduxFactory
