import actions from './actions'


function reduceNamespaces(acum, name)
{
  return {...acum, [name]: actions(name, this)}
}


function namespaces(namespaces, options={})
{
  return namespaces.reduce(reduceNamespaces.bind(options), {})
}


module.exports = namespaces
