const genActionTypes = require('./actionTypes')


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
  if(Array.isArray(basePath))
    return basePath.reduce(reduceNamespaces.bind(options), {})

  if(basePath.endsWith('/')) basePath = basePath.slice(0, basePath.length-1)

  const childReducer = options.childReducer
  const onRollback   = options.onRollback || defaultOnRollback

  const actionTypes = genActionTypes(basePath)

  return function(state = [], action)
  {
    const {meta, payload, type} = action
    if(!type.startsWith(basePath)) return state

    let result = [...state]
    let index = -1
    let item

    const {func, id} = (meta || {})

    if(meta)
    {
      if(func)
      {
        if(type.endsWith('commit'))
          setImmediate(func, null, payload)
        else
          setImmediate(func, payload)

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
      // Create

      case actionTypes.create:
        result.push({...payload})
      break

      case actionTypes.create_commit:
        result[index] = {...item, id: payload}
      break

      case actionTypes.create_rollback:
        onRollback(payload)

        deleteIndex(result, index)
      break


      // Read

      case actionTypes.read:
        console.info(actionTypes.read)

        return state

      case actionTypes.read_commit:
        // Collection
        if(Array.isArray(payload))
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


module.exports = reducer
