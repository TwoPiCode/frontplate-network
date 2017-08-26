
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
  getToken: Function | null = null
) => {
  const request = fetchFactory(method)

  return (
    state: Object|Function,
    ...args
  ) => {
    let _state = state

    /*
      Resolve state if still function.
      Resolve token from state if @getToken.
    */

    _state = selectReduxState(state)
    const token = (
      typeof getToken === 'function'
        ? getToken(_state)
        : null
    )

    /*
      Do request.
    */

    return request(token, ...args)
  }
}

export default fetchReduxFactory
