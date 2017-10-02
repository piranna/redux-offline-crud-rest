import uuid from 'react-native-uuid'

import genActionTypes from './actionTypes'


function reduceActions(acum, {key, func})
{
  return {...acum, [key]: (...args) => this(func(...args))}
}

function reduceMethods(acum, {name, func)
{
  const actionType = `${baseType}#${name}`

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
            url: `${baseUrl}/${basePath}/${id}/${name}`,
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

function reduceNamespaces(acum, name)
{
  return {...acum, [name]: actions(name, this)}
}


function actions(basePath, options={})
{
  const {dispatch, headers, resourceMethods} = options

  let baseUrl = options.baseUrl || ''
  if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length-1)

  const baseType = basePath.slice(0, basePath.length-1).toUpperCase()
  const actionTypes = genActionTypes(baseType)

  const result =
  {
    create(body)
    {
      const id = `tmp_id:${uuid.v4()}`

      return {
        type: actionTypes.add,
        payload: body,
        meta:
        {
          id,
          offline:
          {
            effect:
            {
              url: `${baseUrl}/${basePath}`,
              method: 'POST',
              body,
              headers
            },
            commit: {type: actionTypes.add_commit, meta: {id}},
            rollback: {type: actionTypes.add_rollback, meta: {id}}
          }
        }
      }
    },

    read(id)
    {
      const idPath = (id != null) ? id : ''

      return {
        type: actionTypes.read,
        meta:
        {
          id,
          offline:
          {
            effect: {
              url: `${baseUrl}/${basePath}/${idPath}`,
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
              url: `${baseUrl}/${basePath}/${id}`,
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
              url: `${baseUrl}/${basePath}/${id}`,
              method: 'PATCH',
              body,
              headers
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
              url: `${baseUrl}/${basePath}/${id}`,
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

  if(resourceMethods)
    result = resourceMethods.entries().reduce(reduceMethods, result)

  if(!dispatch) return result

  return result.entries().reduce(reduceActions.bind(dispatch), {})
}

function namespaces(namespaces, options)
{
  return namespaces.reduce(reduceNamespaces.bind(options), {})
}


export default actions
export {namespaces}
