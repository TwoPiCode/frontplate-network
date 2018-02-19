
// @flow

require('es6-promise').polyfill()
require('fetch-everywhere')

import { fetchFactory, GET, POST, PUT, DELETE } from './fetchFactory'
import { networkFactory } from './networkFactory'
import { NetworkError, JSONParseError } from './errors'

export {
  fetchFactory, GET, POST, PUT, DELETE,
  networkFactory, NetworkError, JSONParseError
}

export default networkFactory
