import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import Todos from './modules/Todos'
import fileTodo from './modules/fileTodo'
import treeTodo from './modules/treeTodo'

const reducers = {
  router: router,
  todo: Todos,
  fileTodo: fileTodo,
  treeTodo: treeTodo
}

export default combineReducers(reducers)
