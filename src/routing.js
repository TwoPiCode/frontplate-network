
// @flow

/*
  forceTrailingSlash, forceTrailingSlashOnChange:
    helper to match routes without slashes and keep route pathnames consistent
    in address bar, and hooks into root router route as props.
*/

export const forceTrailingSlash = (
  nextState: Object,
  replace: Function
) => {
  const path = nextState.location.pathname
  if (path.slice(-1) !== '/') {
    replace({...nextState.location, pathname: path + '/'})
  }
}

export const forceTrailingSlashOnChange = (
  prevState: Object,
  nextState: Object,
  replace: Function
) => {
  forceTrailingSlash(nextState, replace)
}

/*
  generateOptions:
    encouraging simple data arrays for passing route information and allowing
    subsequent components a uniform way to deal with route information. accepts
    an array with objects with at least key 'to', which if match the passed
    location.pathname will return the object with an 'active' boolean to then
    use in determining the 'active' state of component routing list elements.
*/

export const generateOptions = (
  options: Array<Object>,
  location: Object
): Array<Object> => {
  return options.map(route => ({
    ...route,
    active: (location.pathname || '').indexOf(route.to) > -1
  }))
}

/*
  isPathPartParam, getPathPartParamName:
    helper path part string functions used in various path resolution functions.
*/

const isPathPartParam = (path) => ((path || '').indexOf(':') !== -1)
const getPathPartParamName = (path) => ((path || '').replace(/\W+/g, ''))

/*
  resolveTitle:
    is a helper function of generateCrumbs.
    used for creating breadcrumb trails to resolve an entity's title using it's
    id to access a key from a lookup table of functions.
*/

const resolveTitle = (route, params, lookup) => {
  const { name, path } = route
  const isParam = isPathPartParam(path)
  const key = isParam ? getPathPartParamName(path) : null
  const resValue = key ? params[key] : null
  const resTitle = (lookup[key] && lookup[key](resValue)) || null
  return key
    ? (resTitle || `${(name || '')}: ${(resValue || '')}`)
    : name
}

/*
  resolvePath:
    is a helper function of generateCrumbs.
    used for creating breadcrumb trails to resolve an url per breadcrumb element
    using it's @route part and @params to substitute values accordingly.
*/

const resolvePath = (routes, params, index) => {
  return routes.reduce((path, route, idx) => {
    if (idx > index + 1) { return path }
    const subpath = (route.path || '')
    const isParam = isPathPartParam(subpath)
    const key = isParam ? getPathPartParamName(subpath) : null
    const part = key ? params[key] : subpath
    return (path || '') + (part)
  }, '')
}

/*
  generateCrumbs:
    helper function for creating an array of object to be passed into a
    breadcrumb forming component, using the current routes array to return
    resolved element titles and urls. a @lookup object contains keys that
    correspond with route keys like ":projectId" using "projectId" in the
    lookup. the value is a function that takes the value found from @params
    with the same key, resulting in an object like:
      { 'projectId': (value) => (store.entities.projects[value] || {}).name }
*/

export const generateCrumbs = (
  routes: Array<Object>,
  params: Object,
  lookup: Object
): Array<Object> => {
  return routes
    .filter((route, idx) => (idx !== 0))
    .map((route, idx) => {
      const title = resolveTitle(route, params, lookup)
      const to = resolvePath(routes, params, idx)
      return ({ title, to })
    })
}
