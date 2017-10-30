# redux-offline-crud-rest
Offline-first persistence for React Native web apps backed by CRUD-based
operations over REST APIs

`redux-offline-crud-rest` is a set of factory helper functions that works as a
client library for web services that offer a CRUD-like functionality over a REST
API. It's design is heavily oriented to be used with
[redux-offline](https://github.com/redux-offline/redux-offline), but being
written in vanilla Javascript and without external dependencies, it's possible
to use it with plain [redux](http://redux.js.org) or also with plain Javascript
functions so far it support the same protocol.

## In-wire data format

Data is transmitted as raw JSON objects in both directions for resources, and as
JSON arrays for collections. Resources must have a server-side generated `_id`
field that uniquely identify the resource inside its collection. CRUD operations
are mapped to their most-alike HTTP method, it's said: `Create -> POST`, `Read
-> GET`, `Update -> PUT` and `Delete -> DELETE`. As an extra feature, it also
maps partial updates with the `PATCH` HTTP method, sending the diff data in raw
JSON too, following the [JSON Merge Patch](https://tools.ietf.org/html/rfc7396)
format specification.

## Install

```sh
npm install redux-offline-crud-rest
```

## How to use it

`redux-offline-crud-rest` helper factories functions are splitted in three:
[actions](#actions), [reducers](#reducers) and [actionTypes](#actionTypes).

### actions

`actions()` function will return an namespace object with a function for each
one of the possible CRUD operations:

* `create(body)`
* `read(id)`
* `update(id, body)`
* `patch(id, body)`
* `delete(id)`

In all cases, `id` will be unique ID to identify a resource under the specified
collection, and `body` will be a JSON object with the actual data to be stored
for that resource except for `patch()` function, that it will be only the
already calculated diff object between the old data and the new one. In all
cases it will be returned an object to be given as input for the `redux`
`dispatch()` function.

Required argument is the `basePath` of the collection where REST requests will
be done, or alternatively an object defining several namespaces and their own
configurations. An optional argument can be used to define both the `redux`
`dispatch()` function so the returned namespace functions will directly call it
instead of return an object to be passed to `dispatch()` manually, and the
headers that will be added to all the requests on this namespace. You can also
define the `baseUrl` in case it's different from the one where the client is
served from.

```js
const actions = require('./actions')

const baseType = 'path/resource'

const namespace = actions(baseType)

namespace.create({msg: 'hello world'})
```

You can also define functions both directly on the `options` object or using its
`resourceMethods` object to define methods that will be called for a given
resource, or for the full collection if an `id` is not provided. Calling them
will send the arguments as a `POST` request, being the arguments defined on the
provided `body`.

```js
const namespace = actions('path', {foo(error, result){...}})

namespace.foo(1234, {msg: 'hello world'})  // => POST /path/1234/foo
```

### reducers

Complementary to the `actions` factory, `reducer` generate a reducer function to
process the CRUD operations for the provided `basePath`, both optimistic and the
response given by the server (`commit`ing the data on success, or doing
`rollback` on it on failure). Optionally you can provide a `childReducer()`
function to process child namespaces, and a `onRollback()` function to define
what to do in case an operation went bad and operation needed to be undo (by
default, just only print an error on the console).

```js
const reducer = require('./reducer')

const namespace = reducer('path')

namespace(state, {})  // => state
```

### actionTypes

This are generated and used internally by the `actions` and the `reducers`, so
you would not need to use them explicitly except for some advanced usage, like
manually `dispatch()`ing some action.

`genActionTypes()` function will return an object mapping all the possible CRUD
operations related actions (requests, commits and rollbacks) with the actual
`redux` action for the provided `baseType`.

```js
const genActionTypes = require('./actionTypes')

const baseType = 'path/resource'

const actionTypes = genActionTypes(baseType)

actionTypes.create         // => 'path/resource#create'
actionTypes.update_commit  // => 'path/resource#update_commit'
```

## Sponsors

[![Quantum BA](quantum-ba.png)](http://www.quantum-ba.com)
