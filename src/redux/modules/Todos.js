import { createAction, handleActions } from 'redux-actions'
import Immutable from 'immutable'
import fetch from 'isomorphic-fetch'
import { checkHttpStatus, parseJSON, API_URL } from '../../common/common'

// Constants
// export const constants = { }

export const FETCH_HEADER_REQUEST = 'FETCH_HEADER_REQUEST'
export const FETCH_HEADER_SUCCESS = 'FETCH_HEADER_SUCCESS'
export const FETCH_HEADER_FAIL = 'FETCH_HEADER_FAIL'

export const UPLOAD_FILE_REQUEST = 'UPLOAD_FILE_REQUEST'
export const UPLOAD_FILE_SUCCESS = 'UPLOAD_FILE_SUCCESS'
export const UPLOAD_FILE_FAIL = 'UPLOAD_FILE_FAIL'

export const PARSE_XLSX_REQUEST = 'PARSE_XLSX_REQUEST'
export const PARSE_XLSX_SUCCESS = 'PARSE_XLSX_SUCCESS'
export const PARSE_XLSX_FAIL = 'PARSE_XLSX_FAIL'

export const getHeaderRequest = createAction(FETCH_HEADER_REQUEST, (data) => data)
export const getHeaderSuccess = createAction(FETCH_HEADER_SUCCESS, (data) => data)
export const getHeaderFail = createAction(FETCH_HEADER_FAIL, (data) => data)

export const uploadFileRequest = createAction(UPLOAD_FILE_REQUEST, (data) => data)
export const uploadFileSuccess = createAction(UPLOAD_FILE_SUCCESS, (data) => data)
export const uploadFileFail = createAction(UPLOAD_FILE_FAIL, (data) => data)

export const parseXlsxRequest = createAction(PARSE_XLSX_REQUEST, (data) => data)
export const parseXlsxSuccess = createAction(PARSE_XLSX_SUCCESS, (data) => data)
export const parseXlsxFail = createAction(PARSE_XLSX_FAIL, (data) => data)

const initialState = Immutable.fromJS({
  myCollection: null,
  mappingHeader: null,
  isFetchHeader: false,
  isFetchingHeader: false,
  statusText: null,
  isUploaded: false,
  isUploading: false,
  isParsing: false,
  isParsed: false
})

export function getMappingHeader () {
  return (dispatch, getState) => {
    dispatch(getHeaderRequest())
    let temp = localStorage.getItem('selectedFile')
    if (temp) {
      let selectedFile = JSON.parse(temp)
      dispatch(getHeaderSuccess(selectedFile))
      return
    }

    dispatch(getHeaderFail({
      status: 405,
      statusText: 'Parse failed'
    }))
  }
}

export function uploadFile (fileData) {
  return (dispatch, getState) => {
    dispatch(uploadFileRequest())
    return fetch(`${API_URL}/Excel/UploadFile`, {
      method: 'POST',
      mode: 'cors',
      body: fileData
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(uploadFileSuccess(response))
        } catch (e) {
          console.log(e)
          dispatch(uploadFileFail({
            status: 403,
            statusText: e.message
          }))
        }
      })
      .catch((error) => {
        dispatch(uploadFileFail({
          status: 401,
          statusText: error.message
        }))
      })
  }
}

export function parseXlsx (data) {
  return (dispatch, getState) => {
    dispatch(parseXlsxRequest())
    return fetch(`${API_URL}/Excel/ParseXlsxNew`, {
      method: 'POST',
      mode: 'cors',
      body: data
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(parseXlsxSuccess(response))
        } catch (e) {
          console.log(e)
          dispatch(parseXlsxFail({
            status: 403,
            statusText: e.message
          }))
        }
      })
      .catch((error) => {
        console.log(error)
        dispatch(parseXlsxFail({
          status: 401,
          statusText: error.message
        }))
      })
  }
}

// Action Creators
export const actions = { getMappingHeader, uploadFile, parseXlsx }

export default handleActions({
  [FETCH_HEADER_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetchingHeader: true,
      isFetchHeader: false
    }
  },
  [FETCH_HEADER_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetchingHeader: false,
      isFetchHeader: true,
      mappingHeader: payload
    }
  },
  [FETCH_HEADER_FAIL]: (state, { payload }) => {
    return {...state,
      isFetchingHeader: false,
      isFetchHeader: false,
      statusText: payload.statusText,
      mappingHeader: null
    }
  },
  [UPLOAD_FILE_REQUEST]: (state, { payload }) => {
    return {...state,
      isUploading: true,
      isUploaded: false
    }
  },
  [UPLOAD_FILE_SUCCESS]: (state, { payload }) => {
    return {...state,
      isUploading: false,
      isUploaded: true,
      myCollection: payload
    }
  },
  [UPLOAD_FILE_FAIL]: (state, { payload }) => {
    return {...state,
      isUploading: false,
      isUploaded: false,
      statusText: payload.statusText,
      myCollection: null
    }
  },
  [PARSE_XLSX_REQUEST]: (state, { payload }) => {
    return {...state,
      isParsing: true,
      isParsed: false
    }
  },
  [PARSE_XLSX_SUCCESS]: (state, { payload }) => {
    return {...state,
      isParsing: false,
      isParsed: true
    }
  },
  [PARSE_XLSX_FAIL]: (state, { payload }) => {
    return {...state,
      isParsing: false,
      isParsed: false,
      statusText: payload.statusText
    }
  }
}, initialState)
