const uuid = require('react-native-uuid')

const genActionTypes = require('./actionTypes')


function composeUrl(...args)
{
  return args.filter(filterComposeUrl).join('/')
}

function filterComposeUrl(item)
{
  return item != null
}

function filterMethods([name, func])
{
  return name !== 'dispatch' && func instanceof Function
}

function reduceActions(acum, [key, func])
{
  return {...acum, [key]: (...args) => this(func(...args))}
}

function reduceFilteredMethods(acum, [key, func])
{
  return {...acum, [key]: func}
}

function reduceNamespaces(acum, name)
{
  return {...acum, [name]: actions(name, this)}
}

function reduceNamespacesObject(acum, [name, options])
{
  return reduceNamespaces.call({...this, ...options}, acum, name)
}


function actions(basePath, options={})
{
  if(Array.isArray(basePath))
    return basePath.reduce(reduceNamespaces.bind(options), {})

  if(typeof basePath !== 'string')
    return Object.entries(basePath).reduce(reduceNamespacesObject.bind(options), {})

  if(basePath.endsWith('/')) basePath = basePath.slice(0, basePath.length-1)

  const {dispatch, headers} = options

  let baseUrl = options.baseUrl || ''
  if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length-1)

  const actionTypes = genActionTypes(basePath)

  function reduceMethods(acum, [name, func])
  {
    const actionType = `${basePath}#${name}`

    return {...acum, [name]: function(id, body)
    {
      const meta = {func, id}

      return {
        type: actionType,
        meta:
        {
          offline:
          {
            effect:
            {
              url: composeUrl(baseUrl, basePath, id, name),
              method: 'POST',
              body,
              headers
            },
            commit: {type: `${actionType}_commit`, meta},
            rollback: {type: `${actionType}_rollback`, meta}
          }
        }
      }
    }}
  }

  let result =
  {
    create(body)
    {
      const id = `tmp_id:${uuid.v4()}`

      return {
        type: actionTypes.create,
        payload: body,
        meta:
        {
          id,
          offline:
          {
            effect:
            {
              url: composeUrl(baseUrl, basePath),
              method: 'POST',
              body,
              headers
            },
            commit: {type: actionTypes.create_commit, meta: {id}},
            rollback: {type: actionTypes.create_rollback, meta: {id}}
          }
        }
      }
    },

    read(id)
    {
      return {
        type: actionTypes.read,
        meta:
        {
          id,
          offline:
          {
            effect: {
              url: composeUrl(baseUrl, basePath, id),
              method: 'GET',
              headers
            },
            commit: {type: actionTypes.read_commit, meta: {id}},
            rollback: {type: actionTypes.read_rollback, meta: {id}}
          }
        }
      }
    },

    update(id, body)
    {
      return {
        type: actionTypes.update,
        payload: body,
        meta:
        {
          id,
          offline:
          {
            effect:
            {
              url: composeUrl(baseUrl, basePath, id),
              method: 'PUT',
              body,
              headers
            },
            commit: {type: actionTypes.update_commit, meta: {id}},
            rollback: {type: actionTypes.update_rollback, meta: {id}}
          }
        }
      }
    },

    patch(id, body)
    {
      return {
        type: actionTypes.patch,
        payload: body,
        meta:
        {
          id,
          offline:
          {
            effect: {
              url: composeUrl(baseUrl, basePath, id),
              method: 'PATCH',
              body,
              headers: {...headers, 'content-type': 'merge-patch+json'}
            },
            commit: {type: actionTypes.patch_commit, meta: {id}},
            rollback: {type: actionTypes.patch_rollback, meta: {id}}
          }
        }
      }
    },

    delete(id)
    {
      return {
        type: actionTypes.delete,
        meta:
        {
          id,
          offline:
          {
            effect:
            {
              url: composeUrl(baseUrl, basePath, id),
              method: 'DELETE',
              headers
            },
            commit: {type: actionTypes.delete_commit, meta: {id}},
            rollback: {type: actionTypes.delete_rollback, meta: {id}}
          }
        }
      }
    }
  }

  let {resourceMethods} = options
  if(!resourceMethods)
    resourceMethods = Object.entries(options).filter(filterMethods)
    .reduce(reduceFilteredMethods, {})

  result = Object.entries(resourceMethods).reduce(reduceMethods, result)

  if(!dispatch) return result

  return Object.entries(result).reduce(reduceActions.bind(dispatch), {})
}


module.exports = actions
