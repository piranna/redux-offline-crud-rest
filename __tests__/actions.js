const actions = require('../actions')


describe('basic', function()
{
  test('basic', function()
  {
    const create = require('./fixtures/create.json')
    const read = require('./fixtures/read.json')
    const update = require('./fixtures/update.json')
    const del = require('./fixtures/delete.json')

    const result = actions('path')

    expect(result.create()).toMatchObject(create)
    expect(result.read()).toMatchObject(read)
    expect(result.update()).toMatchObject(update)
    expect(result.delete()).toMatchObject(del)
  })

  test('patch', function()
  {
    const result = actions('path').patch()

    expect(result).toMatchObject(require('./fixtures/patch.json'))
    expect(result.meta.offline.effect.headers['content-type']).toBe('merge-patch+json')
  })
})

test('dispatch', function()
{
  const create = require('./fixtures/create.json')

  actions('path', {dispatch(action)
  {
    expect(action).toMatchObject(create)
  }}).create()
})

describe('resource methods', function()
{
  test('implicit', function()
  {
    const foo = require('./fixtures/foo.json')

    const options =
    {
      foo(){}
    }

    const result = actions('path', options)

    expect(result.foo()).toMatchObject(foo)
  })

  test('explicit', function()
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
})

describe('namespaces', function()
{
  test('array', function()
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

  test('object', function()
  {
    const result = actions({bar: true, foo: {}})

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
})

test('url endings', function()
{
  const result = actions('path/', {baseUrl: 'http://example/'})

  expect(result.create().meta.offline.effect.url).toBe('http://example/path')
})
