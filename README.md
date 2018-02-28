
# frontplate-network

Make network requests, authentication, and error handling easier.

## Install

```
yarn add frontplate-network
npm install frontplate-network
```

## Usage

### Configuration

```diff
const config = {
  hostUrl: 'http://localhost:5000',
  enableLogging: true, // use in dev to debug request/response data
  loggingHostInfo: true, // true logs hostUrl to console on init
  loggingRequest: true, // true logs the request body per request
  loggingResponse: true, // true logs the request response body per request
}
```

### Making Requests

```
import networkFactory, * as methods from 'frontplate-network'
const { api, requestFactory } = networkFactory(config)
export const GET = requestFactory(methods.GET)

const USERS_ENDPOINT = '/users'
GET(api.template(USERS_ENDPOINT))
  .then((data) => console.log(data))
```

The `api` object exposed from `networkFactory` is an url builder based on `safe-url-assembler`.

```diff
import SafeUrlAssembler from 'safe-url-assembler'
const api = SafeUrlAssembler(hostUrl)
```

### Pushing Data

If your data is in a object form, it will be JSON.stringify'ed for you.

```diff
+ export const POST = requestFactory(methods.POST)

POST(api.template(USERS_ENDPOINT), {name: 'MyUser', city: 'Sydney'})
```

### Adding Authorisation Headers

```diff
function getAuthTokenFromStore () {
  return store.getState().auth.token
}

const requestConfig = {
  mutateRequest: (request: Object) => {
    const token = getAuthTokenFromStore()
    return {
      ...request,
      headers: {
        ...request.headers,
        'Authorization': `Bearer ${token}`
      }
    }
  }
}

- export const GET = requestFactory(methods.GET)
+ export const GET = requestFactory(methods.GET, requestConfig)
```

### Handling Unauthorised Requests

```diff
function handleLogout () {
  // display messages
  // route to login screen
}

const requestConfig = {
+  onResponse: (status) => {
+    if (status === 401) {
+      handleLogout()
+    }
+  }
}
```
