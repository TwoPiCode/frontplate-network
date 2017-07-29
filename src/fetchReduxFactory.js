
// @flow

import { fetchFactory } from './fetchFactory'
import { selectReduxState } from './selectors'

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
    body?: Object|string|null = undefined,
    file?: Object|null = undefined,
    options?: Object = {},
    headers?: Object = {}
  ) => {
    let _state = state

    /*
      Resolve state if still function.
      Resolve token from state if @getToken.
    */

    _state = selectReduxState(state)
    const token = (getToken && getToken(state)) || null

    /*
      Do request.
    */

    return request(token, url, body, file, options, headers)
  }
}

export default fetchReduxFactory
