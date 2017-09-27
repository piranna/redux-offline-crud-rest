import uuid from 'react-native-uuid'

import genActionTypes from './actionTypes'


function actions(basePath, options={})
{
  const headers = options.headers

  let baseUrl = options.baseUrl || ''
  if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length-1)

  const baseType = basePath.slice(0, basePath.length-1).toUpperCase()
  const actionTypes = genActionTypes(baseType)

  return {
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
}


module.exports = actions
