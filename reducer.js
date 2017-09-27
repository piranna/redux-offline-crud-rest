import genActionTypes from './actionTypes'
import {idStrictEqual} from '../index'


function deleteIndex(array, index)
{
  array.splice(index, 1)
}

const defaultOnRollback = console.error.bind(console)


function reducer(basePath, options={})
{
  const childReducer = options.childReducer
  const onRollback   = options.onRollback || defaultOnRollback

  const baseType = basePath.slice(0, basePath.length-1).toUpperCase()
  const actionTypes = genActionTypes(baseType)

  return function(state = [], action)
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

      case actionTypes.add:
        result.push({...payload})
      break

      case actionTypes.add_commit:
        result[index] = {...item, id: payload}
      break

      case actionTypes.add_rollback:
        onRollback(payload)

        deleteIndex(result, index)
      break


      // Update

      case actionTypes.update:
        result[index] = {...payload, _rollback: item}
      break

      case actionTypes.update_commit:
        result[index] = {...item, _rollback: undefined}
      break

      case actionTypes.update_rollback:
        onRollback(payload)

        result[index] = {...item._rollback}
      break


      // Delete

      case actionTypes.delete:
        result[index] = {...item, _pendingDeletion: true}
      break

      case actionTypes.delete_commit:
        deleteIndex(result, index)
      break

      case actionTypes.delete_rollback:
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


module.exports = reducer
