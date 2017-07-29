
// @flow

/*
  NetworkError:
    custom error containing status and body of request information
*/

export const NetworkError = (status: number, body: any) {
  this.name = 'NetworkError'
  this.status = status
  this.body = body
  this.message = 'A network error occurred. Please try again.'
  this.stack = (new Error()).stack
}
NetworkError.prototype = Object.create(Error.prototype)
NetworkError.prototype.constructor = NetworkError

/*
  JSONParseError:
    custom error containing status and body of request body that is malformed
*/

export const JSONParseError = (status: number, body: any) {
  this.name = 'JSONParseError'
  this.status = status
  this.body = body
  this.message = 'Received unexpected response from the server.'
  this.stack = (new Error()).stack
}
JSONParseError.prototype = Object.create(Error.prototype)
JSONParseError.prototype.constructor = JSONParseError
