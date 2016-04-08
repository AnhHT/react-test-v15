import { createAction, handleActions } from 'redux-actions'
import Immutable from 'immutable'
import fetch from 'isomorphic-fetch'
import { checkHttpStatus, parseJSON, API_URL } from '../../common/common'
import { push } from 'react-router-redux'

// Constants
// export const constants = { }
export const GET_FILES_REQUEST = 'GET_FILES_REQUEST'
export const GET_FILES_SUCCESS = 'GET_FILES_SUCCESS'
export const GET_FILES_FAIL = 'GET_FILES_FAIL'

export const SAVE_FILE_REQUEST = 'SAVE_FILE_REQUEST'
export const SAVE_FILE_SUCCESS = 'SAVE_FILE_SUCCESS'
export const SAVE_FILE_FAIL = 'SAVE_FILE_FAIL'

export const GET_PREVIEW_LAYOUT_REQUEST = 'GET_PREVIEW_LAYOUT_REQUEST'
export const GET_PREVIEW_LAYOUT_SUCCESS = 'GET_PREVIEW_LAYOUT_SUCCESS'
export const GET_PREVIEW_LAYOUT_FAIL = 'GET_PREVIEW_LAYOUT_FAIL'

export const getFilesRequest = createAction(GET_FILES_REQUEST, (data) => data)
export const getFilesSuccess = createAction(GET_FILES_SUCCESS, (data) => data)
export const getFilesFail = createAction(GET_FILES_FAIL, (data) => data)

export const saveFileRequest = createAction(SAVE_FILE_REQUEST, (data) => data)
export const saveFileSuccess = createAction(SAVE_FILE_SUCCESS, (data) => data)
export const saveFileFail = createAction(SAVE_FILE_FAIL, (data) => data)

export const getPreviewLayoutRequest = createAction(GET_PREVIEW_LAYOUT_REQUEST, (data) => data)
export const getPreviewLayoutSuccess = createAction(GET_PREVIEW_LAYOUT_SUCCESS, (data) => data)
export const getPreviewLayoutFail = createAction(GET_PREVIEW_LAYOUT_FAIL, (data) => data)

const initialState = Immutable.fromJS({
  files: null,
  previewLayout: null,
  isFetch: false,
  isFetching: false,
  isSaving: false,
  isSaved: false,
  isFetchLayout: false,
  isFetchingLayout: false,
  statusText: null
})

export function getFiles () {
  return (dispatch, getState) => {
    dispatch(getFilesRequest())
    return fetch(`${API_URL}/Excel/GetFilesTeamplateExecl`, {
      method: 'get'
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(getFilesSuccess(response))
        } catch (e) {
          dispatch(getFilesFail({
            status: 405,
            statusText: e
          }))
        }
      })
    .catch((error) => {
      dispatch(getFilesFail({
        status: 405,
        statusText: error.message
      }))
    })
  }
}

export function getPreviewLayout (fileName) {
  return (dispatch, getState) => {
    dispatch(getPreviewLayoutRequest())
    return fetch(`${API_URL}/Excel/GetExeclModel?filename=${fileName}`, {
      method: 'get'
    }).then(checkHttpStatus)
      .then(parseJSON)
      .then((response) => {
        try {
          dispatch(getPreviewLayoutSuccess(response))
        } catch (e) {
          dispatch(getPreviewLayoutFail({
            status: 405,
            statusText: e
          }))
        }
      })
    .catch((error) => {
      dispatch(getPreviewLayoutFail({
        status: 405,
        statusText: error.message
      }))
    })
  }
}

export function saveSelectedFile (selectedFile) {
  return (dispatch, getState) => {
    dispatch(saveFileRequest())
    if (!selectedFile || !selectedFile.fileName) {
      dispatch(saveFileFail({
        status: 405,
        statusText: 'Something\'s gone wrong'
      }))
    }

    localStorage.setItem('selectedFile', JSON.stringify(selectedFile))
    dispatch(push('/data'))
    dispatch(saveFileSuccess({
      statusText: 'OK'
    }))
  }
}

export const actions = { getFiles, getPreviewLayout, saveSelectedFile }

export default handleActions({
  [GET_FILES_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetching: true,
      isFetch: false
    }
  },
  [GET_FILES_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetching: false,
      isFetch: true,
      files: payload
    }
  },
  [GET_FILES_FAIL]: (state, { payload }) => {
    return {...state,
      isFetching: false,
      statusText: payload.statusText,
      files: null
    }
  },
  [GET_PREVIEW_LAYOUT_REQUEST]: (state, { payload }) => {
    return {...state,
      isFetchingLayout: true,
      isFetchLayout: false
    }
  },
  [GET_PREVIEW_LAYOUT_SUCCESS]: (state, { payload }) => {
    return {...state,
      isFetchingLayout: false,
      isFetchLayout: true,
      previewLayout: payload
    }
  },
  [GET_PREVIEW_LAYOUT_FAIL]: (state, { payload }) => {
    return {...state,
      isFetchingLayout: false,
      isFetchLayout: false,
      statusText: payload.statusText,
      previewLayout: null
    }
  },
  [SAVE_FILE_REQUEST]: (state, { payload }) => {
    return {...state,
      isSaving: true,
      isSaved: false
    }
  },
  [SAVE_FILE_SUCCESS]: (state, { payload }) => {
    return {...state,
      isSaving: false,
      isSaved: true
    }
  },
  [SAVE_FILE_FAIL]: (state, { payload }) => {
    return {...state,
      isSaving: false,
      statusText: payload.statusText
    }
  }
}, initialState)
