
// @flow

/*
  connect:
    enforce clear isolation of redux state props from component props.
*/

import { connect as _connect } from 'react-redux'
export const connect = (...args: Array<mixed>) => {
  return _connect(state => ({ store: state }), ...args)
}

/*
  pending, fulfilled, rejected:
    helpers for writing reducers to handle specific promise outcomes.
*/

export const pending = (type: string) => `${type}_PENDING`
export const fulfilled = (type: string) => `${type}_FULFILLED`
export const rejected = (type: string) => `${type}_REJECTED`

/*
  unpack:
    helper to suppress flow errors when accessing normalised entity data.
*/

export const unpack = (obj: Object) => Object.keys(obj).map(key => obj[key])
