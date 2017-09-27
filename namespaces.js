import actions from './actions'


function namespaces(namespaces, options={})
{
  const {dispatch, ...actionOptions} = options

  function reduceActions(acum, entry)
  {
    const {key, func} = entry

    return {...acum, [key]: (...args) => dispatch(func(...args))}
  }

  return namespaces.reduce(dispatch ?
    function(acum, name)
    {
      return {...acum, [name]: actions(name, actionOptions)
                               .entries()
                               .reduce(reduceActions, {})}
    } :
    function(acum, name)
    {
      return {...acum, [name]: actions(name, actionOptions)}
    }
  , {})
}


module.exports = namespaces
