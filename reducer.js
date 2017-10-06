import genActionTypes from './actionTypes'


function deleteIndex(array, index)
{
  array.splice(index, 1)
}

function idStrictEqual(element)
{
  const {id, uid} = element  // TODO deprecate `uid`

  return (id || uid) === this.toString()
}

function reduceNamespaces(acum, name)
{
  return {...acum, [name]: reducer(name, this)}
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

    const {func, id} = (meta || {})

    if(meta)
    {
      if(func)
      {
        if(type.endsWith('commit'))
          func(null, payload)
        else
          func(payload)

        return state
      }

      if(id)
      {
        index = result.findIndex(idStrictEqual, id)
        item = result[index]
      }
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


      // Read

      case actionTypes.read:
        console.info(actionTypes.read)

        return state

      case actionTypes.read_commit:
        // Collection
        if(id == null)
          result = [...payload]

        // Non-existing resource
        else if(index == -1)
          result.push({...payload})

        // Existing resource
        else
          result[index] = {...payload}
      break

      case actionTypes.read_rollback:
        onRollback(payload)

        return state


      // Update & Patch

      case actionTypes.update:
        result[index] = {...payload, _rollback: item}
      break

      case actionTypes.patch:
        result[index] = {...item, ...payload, _rollback: item}
      break

      case actionTypes.update_commit:
      case actionTypes.patch_commit:
        result[index] = {...item, _rollback: undefined}
      break

      case actionTypes.update_rollback:
      case actionTypes.patch_rollback:
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

function namespaces(namespaces, options)
{
  return namespaces.reduce(reduceNamespaces.bind(options), {})
}


export default reducer
export {namespaces}
