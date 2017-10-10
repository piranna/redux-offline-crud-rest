const reducer = require('../reducer')


test('basic', function()
{
  const result = reducer('path')

  expect(result).toBeInstanceOf(Function)

  expect(result(undefined, {type: ''})).toEqual([])

  expect(result([], {type: 'path#create', payload: {a: 'a'}})).toEqual([{a: 'a'}])
  expect(result([{a: 'a', id: 'tmp'}], {type: 'path#create_commit', meta:{id: 'tmp'}, payload: 'id'})).toEqual([{a: 'a', id: 'id'}])
  expect(result([{a: 'a', id: 'tmp'}], {type: 'path#create_rollback', meta:{id: 'tmp'}})).toEqual([])

  const state = []
  expect(result(state, {type: 'path#read'})).toBe(state)
  expect(result([], {type: 'path#read_commit', payload: {a: 'a', id: 'id'}})).toEqual([{a: 'a', id: 'id'}])
  expect(result(state, {type: 'path#read_rollback'})).toBe(state)

  expect(result([{a: 'a', id: 'id'}], {type: 'path#update', meta:{id: 'id'}, payload: {a: 'b', id: 'id'}})).toEqual([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}])
  expect(result([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}], {type: 'path#update_commit', meta:{id: 'id'}})).toEqual([{a: 'b', id: 'id'}])
  expect(result([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}], {type: 'path#update_rollback', meta:{id: 'id'}})).toEqual([{a: 'a', id: 'id'}])

  expect(result([{a: 'a', id: 'id'}], {type: 'path#patch', meta:{id: 'id'}, payload: {a: 'b'}})).toEqual([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}])
  expect(result([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}], {type: 'path#patch_commit', meta:{id: 'id'}})).toEqual([{a: 'b', id: 'id'}])
  expect(result([{a: 'b', id: 'id', _rollback: {a: 'a', id: 'id'}}], {type: 'path#patch_rollback', meta:{id: 'id'}})).toEqual([{a: 'a', id: 'id'}])

  expect(result([{a: 'a', id: 'id'}], {type: 'path#delete', meta:{id: 'id'}})).toEqual([{a: 'a', id: 'id', _pendingDeletion: true}])
  expect(result([{a: 'a', id: 'id', _pendingDeletion: true}], {type: 'path#delete_commit', meta:{id: 'id'}})).toEqual([])
  expect(result([{a: 'a', id: 'id', _pendingDeletion: true}], {type: 'path#delete_rollback', meta:{id: 'id'}})).toEqual([{a: 'a', id: 'id'}])
})

describe('methods', function()
{
  test('commit', function()
  {
    const result = reducer('path')

    const state = []
    const payload = {a: 'a'}

    expect(result(state, {type: 'path#foo'})).toBe(state)
  })

  test('commit', function(done)
  {
    expect.assertions(3)

    const result = reducer('path')

    const state = []
    const payload = {a: 'a'}

    expect(result(state, {type: 'path#foo_commit', meta:
    {
      func(error, result)
      {
        expect(error).toBeFalsy()
        expect(result).toEqual(payload)

        done()
      }
    },
    payload})).toBe(state)
  })

  test('rollback', function(done)
  {
    expect.assertions(2)

    const result = reducer('path')

    const state = []
    const payload = {a: 'a'}

    expect(result(state, {type: 'path#foo_rollback', meta:
    {
      func(error)
      {
        expect(error).toEqual(payload)

        done()
      }
    },
    payload})).toBe(state)
  })
})
