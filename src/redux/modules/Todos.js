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

export const FETCH_FIELDS_REQUEST = 'FETCH_FIELDS_REQUEST'
export const FETCH_FIELDS_SUCCESS = 'FETCH_FIELDS_SUCCESS'
export const FETCH_FIELDS_FAIL = 'FETCH_FIELDS_FAIL'

export const FETCH_TREE_REQUEST = 'FETCH_TREE_REQUEST'
export const FETCH_TREE_SUCCESS = 'FETCH_TREE_SUCCESS'
export const FETCH_TREE_FAIL = 'FETCH_TREE_FAIL'

export const getHeaderRequest = createAction(FETCH_HEADER_REQUEST, (data) => data)
export const getHeaderSuccess = createAction(FETCH_HEADER_SUCCESS, (data) => data)
export const getHeaderFail = createAction(FETCH_HEADER_FAIL, (data) => data)

export const uploadFileRequest = createAction(UPLOAD_FILE_REQUEST, (data) => data)
export const uploadFileSuccess = createAction(UPLOAD_FILE_SUCCESS, (data) => data)
export const uploadFileFail = createAction(UPLOAD_FILE_FAIL, (data) => data)

export const parseXlsxRequest = createAction(PARSE_XLSX_REQUEST, (data) => data)
export const parseXlsxSuccess = createAction(PARSE_XLSX_SUCCESS, (data) => data)
export const parseXlsxFail = createAction(PARSE_XLSX_FAIL, (data) => data)

export const getFieldsRequest = createAction(FETCH_FIELDS_REQUEST, (data) => data)
export const getFieldsSuccess = createAction(FETCH_FIELDS_SUCCESS, (data) => data)
export const getFieldsFail = createAction(FETCH_FIELDS_FAIL, (data) => data)

export const getTreeRequest = createAction(FETCH_TREE_REQUEST, (data) => data)
export const getTreeSuccess = createAction(FETCH_TREE_SUCCESS, (data) => data)
export const getTreeFail = createAction(FETCH_TREE_FAIL, (data) => data)

const initialState = Immutable.fromJS({
  myCollection: null,
  mappingHeader: null,
  isFetchHeader: false,
  isFetchingHeader: false,
  statusText: null,
  status: 0,
  isUploaded: false,
  isUploading: false,
  isParsing: false,
  isParsed: false,
  mappingFields: null,
  isFetchFields: false,
  isFetchingFields: false,
  treeData: null,
  isFetchTree: false,
  isFetchingTree: false
})

export function getFields () {
  return (dispatch, getState) => {
    dispatch(getFieldsRequest())
    return fetch(`${API_URL}/Fields/GetAll`, {
      method: 'GET',
      mode: 'cors'
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(getFieldsSuccess(response))
        } catch (e) {
          console.log(e)
          dispatch(getFieldsFail({
            status: 403,
            statusText: e.message
          }))
        }
      })
      .catch((error) => {
        dispatch(getFieldsFail({
          status: 401,
          statusText: error.message
        }))
      })
  }
}

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
  console.log('Parse Data >>> ', JSON.stringify(data))
  return (dispatch, getState) => {
    dispatch(parseXlsxRequest())
    return fetch(`${API_URL}/Excel/ParseXlsxNew`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
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

export function getTreeData () {
  return (dispatch, getState) => {
    dispatch(getTreeRequest())
    return fetch('/data-tree.json', {
      method: 'GET',
      mode: 'cors'
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(getTreeSuccess(response))
        } catch (e) {
          console.log(e)
          dispatch(getTreeFail({
            status: 403,
            statusText: e.message
          }))
        }
      })
      .catch((error) => {
        dispatch(getTreeFail({
          status: 401,
          statusText: error.message
        }))
      })
  }
}

// Action Creators
export const actions = { getFields, getMappingHeader, uploadFile, parseXlsx, getTreeData }

export default handleActions({
  [FETCH_FIELDS_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetchingFields: true,
      isFetchFields: false
    }
  },
  [FETCH_FIELDS_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetchingFields: false,
      isFetchFields: true,
      status: 200,
      mappingFields: payload
    }
  },
  [FETCH_FIELDS_FAIL]: (state, { payload }) => {
    return {...state,
      isFetchingFields: false,
      isFetchFields: false,
      statusText: payload.statusText,
      status: payload.status,
      mappingFields: null
    }
  },
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
      status: 200,
      mappingHeader: payload
    }
  },
  [FETCH_HEADER_FAIL]: (state, { payload }) => {
    return {...state,
      isFetchingHeader: false,
      isFetchHeader: false,
      statusText: payload.statusText,
      status: payload.status,
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
      status: 200,
      myCollection: payload
    }
  },
  [UPLOAD_FILE_FAIL]: (state, { payload }) => {
    return {...state,
      isUploading: false,
      isUploaded: false,
      statusText: payload.statusText,
      status: payload.status,
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
      isParsed: true,
      status: 200
    }
  },
  [PARSE_XLSX_FAIL]: (state, { payload }) => {
    return {...state,
      isParsing: false,
      isParsed: false,
      statusText: payload.statusText,
      status: payload.status
    }
  },
  [FETCH_TREE_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetchingTree: true,
      isFetchTree: false
    }
  },
  [FETCH_TREE_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetchingTree: false,
      isFetchTree: true,
      treeData: payload,
      status: 200
    }
  },
  [FETCH_TREE_FAIL]: (state, { payload }) => {
    return {...state,
      isFetchTree: false,
      isFetchingTree: false,
      statusText: payload.statusText,
      status: payload.status,
      treeData: null
    }
  }
}, initialState)
