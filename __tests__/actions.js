const actions = require('../actions')


test('basic', function()
{
  const create = require('./fixtures/create.json')
  const read = require('./fixtures/read.json')
  const update = require('./fixtures/update.json')
  const patch = require('./fixtures/patch.json')
  const del = require('./fixtures/delete.json')

  const result = actions('path')

  expect(result.create()).toMatchObject(create)
  expect(result.read()).toMatchObject(read)
  expect(result.update()).toMatchObject(update)
  expect(result.patch()).toMatchObject(patch)
  expect(result.delete()).toMatchObject(del)
})

test('dispatch', function()
{
  const create = require('./fixtures/create.json')

  actions('path', {dispatch(action)
  {
    expect(action).toMatchObject(create)
  }}).create()
})

test('methods', function()
{
  const foo = require('./fixtures/foo.json')

  const options =
  {
    resourceMethods:
    {
      foo(){}
    }
  }

  const result = actions('path', options)

  expect(result.foo()).toMatchObject(foo)
})
