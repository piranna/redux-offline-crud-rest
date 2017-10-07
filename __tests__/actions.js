const actions = require('../actions')


test('basic', function()
{
  const create = require('./fixtures/create.json')
  const read = require('./fixtures/read.json')

  const result = actions('path')

  expect(result.create()).toMatchObject(create)
  expect(result.read()).toMatchObject(read)
  // expect(result.update()).toEqual(expected)
  // expect(result.patch()).toEqual(expected)
  // expect(result.delete()).toEqual(expected)
})
