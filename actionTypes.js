function genActionTypes(baseType)
{
  const actionType_add    = `${baseType}#ADD`
  const actionType_read   = `${baseType}#READ`
  const actionType_update = `${baseType}#UPDATE`
  const actionType_patch  = `${baseType}#PATCH`
  const actionType_delete = `${baseType}#DELETE`

  return {
    add         : actionType_add,
    add_commit  : `${actionType_add}_COMMIT`,
    add_rollback: `${actionType_add}_ROLLBACK`,

    read         : actionType_read,
    read_commit  : `${actionType_read}_COMMIT`,
    read_rollback: `${actionType_read}_ROLLBACK`,

    update         : actionType_update,
    update_commit  : `${actionType_update}_COMMIT`,
    update_rollback: `${actionType_update}_ROLLBACK`,

    patch         : actionType_patch,
    patch_commit  : `${actionType_patch}_COMMIT`,
    patch_rollback: `${actionType_patch}_ROLLBACK`,

    delete         : actionType_delete,
    delete_commit  : `${actionType_delete}_COMMIT`,
    delete_rollback: `${actionType_delete}_ROLLBACK`
  }
}


module.exports = genActionTypes
