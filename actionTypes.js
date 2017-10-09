function genActionTypes(baseType)
{
  const actionType_create = `${baseType}#create`
  const actionType_read   = `${baseType}#read`
  const actionType_update = `${baseType}#update`
  const actionType_patch  = `${baseType}#patch`
  const actionType_delete = `${baseType}#delete`

  return {
    create         : actionType_create,
    create_commit  : `${actionType_create}_commit`,
    create_rollback: `${actionType_create}_rollback`,

    read         : actionType_read,
    read_commit  : `${actionType_read}_commit`,
    read_rollback: `${actionType_read}_rollback`,

    update         : actionType_update,
    update_commit  : `${actionType_update}_commit`,
    update_rollback: `${actionType_update}_rollback`,

    patch         : actionType_patch,
    patch_commit  : `${actionType_patch}_commit`,
    patch_rollback: `${actionType_patch}_rollback`,

    delete         : actionType_delete,
    delete_commit  : `${actionType_delete}_commit`,
    delete_rollback: `${actionType_delete}_rollback`
  }
}


module.exports = genActionTypes
