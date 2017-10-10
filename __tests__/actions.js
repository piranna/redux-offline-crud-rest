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

test('namespaces', function()
{
  const result = actions(['bar', 'foo'])

  expect(result.bar.create).toBeInstanceOf(Function)
  expect(result.bar.read  ).toBeInstanceOf(Function)
  expect(result.bar.update).toBeInstanceOf(Function)
  expect(result.bar.patch ).toBeInstanceOf(Function)
  expect(result.bar.delete).toBeInstanceOf(Function)

  expect(result.foo.create).toBeInstanceOf(Function)
  expect(result.foo.read  ).toBeInstanceOf(Function)
  expect(result.foo.update).toBeInstanceOf(Function)
  expect(result.foo.patch ).toBeInstanceOf(Function)
  expect(result.foo.delete).toBeInstanceOf(Function)
})

test('url endings', function()
{
  const result = actions('path/', {baseUrl: 'http://example/'})

  expect(result.create().meta.offline.effect.url).toBe('http://example/path')
})
