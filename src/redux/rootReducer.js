import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import Todos from './modules/Todos'

const reducers = {
  router: router,
  todo: Todos
}

export default combineReducers(reducers)
