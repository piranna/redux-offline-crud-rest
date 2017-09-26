import uuid from 'react-native-uuid'

import {idStrictEqual} from '../index'


function deleteIndex(array, index)
{
  array.splice(index, 1)
}

const defaultOnRollback = console.error.bind(console)


function reduxOfflineCrudRest(basePath, options={})
{
  let baseUrl = options.baseUrl || ''
  if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length-1)

  const childReducer  = options.childReducer
  const onRollback    = options.onRollback || defaultOnRollback

  const baseType = basePath.slice(0, basePath.length-1).toUpperCase()

  const actionType_add          = `${baseType}#ADD`
  const actionType_add_commit   = `${actionType_add}_COMMIT`
  const actionType_add_rollback = `${actionType_add}_ROLLBACK`

  const actionType_update          = `${baseType}#UPDATE`
  const actionType_update_commit   = `${actionType_update}_COMMIT`
  const actionType_update_rollback = `${actionType_update}_ROLLBACK`

  const actionType_delete          = `${baseType}#DELETE`
  const actionType_delete_commit   = `${actionType_delete}_COMMIT`
  const actionType_delete_rollback = `${actionType_delete}_ROLLBACK`


  return {
    actions:
    {
      create(body)
      {
        const id = `tmp_id:${uuid.v4()}`

        return {
          type: actionType_add,
          payload: body,
          meta:
          {
            id,
            offline:
            {
              effect: {url: `${baseUrl}/${basePath}`, method: 'POST', body},
              commit: {type: actionType_add_commit, meta: {id}},
              rollback: {type: actionType_add_rollback, meta: {id}}
            }
          }
        }
      },

      update(id, body)
      {
        return {
          type: actionType_update,
          payload: body,
          meta:
          {
            id,
            offline:
            {
              effect: {url: `${baseUrl}/${basePath}/${id}`, method: 'PUT', body},
              commit: {type: actionType_update_commit, meta: {id}},
              rollback: {type: actionType_update_rollback, meta: {id}}
            }
          }
        }
      },

      delete(id)
      {
        return {
          type: actionType_delete,
          meta:
          {
            id,
            offline:
            {
              effect: {url: `${baseUrl}/${basePath}/${id}`, method: 'DELETE'},
              commit: {type: actionType_delete_commit, meta: {id}},
              rollback: {type: actionType_delete_rollback, meta: {id}}
            }
          }
        }
      }
    },

    reducer(state = [], action)
    {
      const {meta, payload, type} = action
      if(!type.startsWith(baseType)) return state

      let result = [...state]
      let index
      let item

      const id = meta && meta.id
      if(id)
      {
        index = result.findIndex(idStrictEqual, id)
        item = result[index]
      }

      switch(type)
      {
        // Add

        case actionType_add:
          result.push({...payload})
        break

        case actionType_add_commit:
          result[index] = {...item, id: payload}
        break

        case actionType_add_rollback:
          onRollback(payload)

          deleteIndex(result, index)
        break


        // Update

        case actionType_update:
          result[index] = {...payload, _rollback: item}
        break

        case actionType_update_commit:
          result[index] = {...item, _rollback: undefined}
        break

        case actionType_update_rollback:
          onRollback(payload)

          result[index] = {...item._rollback}
        break


        // Delete

        case actionType_delete:
          result[index] = {...item, _pendingDeletion: true}
        break

        case actionType_delete_commit:
          deleteIndex(result, index)
        break

        case actionType_delete_rollback:
          onRollback(payload)

          result[index] = {...item, _pendingDeletion: undefined}
        break


        // Unknown action, use child redurec or return untouched current state

        default:
          if(!childReducer) return state

          if(!item)
          {
            // TODO notify user

            return state
          }

          item.projects = childReducer(item.projects,
          {
            ...action,
            meta: {...meta, id: meta.project_id, project_id: undefined}
          })
      }

      // Return modified state
      return result
    }
  }
}


module.exports = reduxOfflineCrudRest
