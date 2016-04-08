import reducer, { initialState } from 'redux/modules/Todos'

describe('(Redux) Todos', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})
