
// @flow

/*
  NetworkError:
    custom error containing status and body of request information
*/

function NetworkError (status: number, body: any) {
  this.status = status
  this.body = body
  this.message = `Received ${status} response from server.`
  this.stack = (new Error()).stack
}
NetworkError.prototype = Object.create(Error.prototype)
NetworkError.prototype.constructor = NetworkError

/*
  JSONParseError:
    custom error containing status and body of request body that is malformed
*/

function JSONParseError (status: number, body: any) {
  this.status = status
  this.body = body
  this.message = 'Failed to parse response from server.'
  this.stack = (new Error()).stack
}
JSONParseError.prototype = Object.create(Error.prototype)
JSONParseError.prototype.constructor = JSONParseError

export {
  NetworkError, JSONParseError
}
