import { createAction, handleActions } from 'redux-actions'
import Immutable from 'immutable'
import fetch from 'isomorphic-fetch'
import { checkHttpStatus, parseJSON } from '../../common/common'

export const RE_ORDER_DATA = 'RE_ORDER_DATA'
export const FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST'
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS'
export const FETCH_DATA_FAIL = 'FETCH_DATA_FAIL'

export const getDataRequest = createAction(FETCH_DATA_REQUEST, (data) => data)
export const getDataSuccess = createAction(FETCH_DATA_SUCCESS, (data) => data)
export const getDataFail = createAction(FETCH_DATA_FAIL, (data) => data)

export const reorderDataAction = createAction(RE_ORDER_DATA, (data) => data)

const initialState = Immutable.fromJS({
  isFetching: false,
  isFetch: false,
  treeCollection: null,
  statusText: null
})

export function getData () {
  return (dispatch, getState) => {
    dispatch(getDataRequest())
    return fetch('/offices.json', {
      method: 'get',
      headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          let temp = []
          reOrderOffice(response.items, -1, temp)
          dispatch(getDataSuccess({filteredList: temp}))
        } catch (e) {
          console.log(e)
          dispatch(getDataFail({
            status: 405,
            statusText: e
          }))
        }
      })
    .catch((error) => {
      dispatch(getDataFail({
        status: 405,
        statusText: error.message
      }))
    })
  }
}

function reOrderOffice (normalArr, parrentOfficeId, filteredList) {
  let childs = normalArr.filter((item) => {
    return item.ParrentOfficeId === parrentOfficeId
  })

  childs.sort((l, r) => {
    return l.OrderNo > r.OrderNo ? 1 : -1
  })

  childs.map((item) => {
    item.Orders = []
    for (let i = 0; i < childs.length; i++) {
      item.Orders = [...item.Orders, ({ OrderNo: (i + 1), Text: (i + 1) })]
    }

    filteredList.push(item)
    reOrderOffice(normalArr, item.ID, filteredList)
  })
}

export function orderData (data) {
  return (dispatch, getState) => {
    let temp = []
    reOrderOffice(data, -1, temp)
    dispatch(reorderDataAction({filteredList: temp}))
  }
}

export const actions = { getData, orderData }

export default handleActions({
  [FETCH_DATA_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetching: true,
      isFetch: false
    }
  },
  [FETCH_DATA_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetching: false,
      isFetch: true,
      treeCollection: payload
    }
  },
  [FETCH_DATA_FAIL]: (state, { payload }) => {
    return {...state,
      isFetching: false,
      isFetch: false,
      statusText: payload.statusText,
      treeCollection: null
    }
  },
  [RE_ORDER_DATA]: (state, { payload }) => {
    return {...state,
      treeCollection: payload
    }
  }
}, initialState)
