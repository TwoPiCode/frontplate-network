
// @flow

export const selectReduxState = (state: Object|Function): Object => {
  return typeof state === 'function' ? state() : state
}

export const selectUrlString = (url: Object|string): string => {
  return url.toString ? url.toString() : url
}

export const selectBodyJSON = (body: Object|string): string => {
  return typeof body === 'object' ? JSON.stringify(body) : body
}
