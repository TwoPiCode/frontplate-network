
// @flow

import { createStore, applyMiddleware } from 'redux'

// redux thunks and promises are default
import thunkMiddleware from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware'

// redux dev tools is useful for development
import { composeWithDevTools } from 'remote-redux-devtools'

// immutability and functional state manipulation are default
import Immutable from 'seamless-immutable'
import { combineReducers } from 'redux-seamless-immutable'

/*
  configureStore:
    helper for building a simple redux store structure.
    @state: initial state object that will cast as an immutable structure.
    @reducers: allow for additional reducers.
    @middleware: allow for additional middleware.
*/

export const configureStore = (
  state: Object = {},
  reducers: Object = {},
  middleware: Array<Object> = []
): Object => {
  // cast state into an immutable structure
  const _state = Immutable(state)
  // include application specific reducers
  const _reducers = {...reducers}
  // include thunkMiddleware and promiseMiddleware
  const _middleware = [thunkMiddleware, promiseMiddleware(), ...middleware]

  const store = createStore(
    combineReducers(_reducers),
    _state,
    composeWithDevTools(
      applyMiddleware(..._middleware)
    )
  )
  return store
}

// provide a delicious medium-rare store ready for consumption; like a steak
export default configureStore()
