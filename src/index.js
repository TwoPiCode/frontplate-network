
// @flow

require('es6-promise').polyfill()
require('fetch-everywhere')

import { fetchFactory, GET, POST, PUT, DELETE, PATCH } from './fetchFactory'
import { networkFactory } from './networkFactory'
import { NetworkError, JSONParseError } from './errors'

export {
  fetchFactory, GET, POST, PUT, DELETE, PATCH,
  networkFactory, NetworkError, JSONParseError
}

export default networkFactory
