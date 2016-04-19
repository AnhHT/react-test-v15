import React, {Component, PropTypes} from 'react'
import MappingView from './MappingView'
import {actions as manageData} from '../../redux/modules/Todos'
import {connect} from 'react-redux'
import classes from './Index.scss'

const mapStateToProps = (state) => ({
  isUploading: state.todo.isUploading,
  isUploaded: state.todo.isUploaded,
  isFetchFields: state.todo.isFetchFields,
  isFetchingFields: state.todo.isFetchingFields,
  data: state.todo.myCollection,
  mappingFields: state.todo.mappingFields,
  status: state.todo.status
})

export default class Index extends Component {
  static propTypes = {
    data: PropTypes.object,
    isUploading: PropTypes.bool,
    isUploaded: PropTypes.bool,
    uploadFile: PropTypes.func,
    parseXlsx: PropTypes.func,
    mappingFields: PropTypes.array,
    getFields: PropTypes.func,
    isFetchFields: PropTypes.bool,
    status: PropTypes.number
  };

  constructor (props) {
    super(props)
    this.state = {
      fileData: null,
      uploadStep1: 'Thực hiện chuyển đổi dữ liệu từ file Excel định dạng .xlsx hoặc sửa một mẫu có sẵn!'
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.status > 400) {
      this.setState({uploadStep1: 'Đã xảy ra lỗi hệ thống !'})
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    if (this.state.fileData) {
      this.setState({uploadStep1: ''})
      this.props.uploadFile(this.state.fileData)
    } else {
      this.setState({uploadStep1: 'Hãy chọn một file Excel định dạng .xlsx !'})
    }
  }

  handleFile (e) {
    let formData = new FormData()
    let file = e.target.files[0]
    formData.append('rawFile', file)
    this.setState({fileData: formData}, () => {
      this.setState({uploadStep1: 'Bấm nút Upload để tiếp tục công việc.'})
    })
  }

  handleGetTemplate (e) {
    console.log('Hãy chọn một mẫu bất kỳ >>>')
  }

  render () {
    let key = 1
    const {isUploading, isUploaded, data, getFields, mappingFields, parseXlsx, isFetchFields, status} = this.props
    const mappingView = (isUploaded && data) ? (
      <MappingView key={key} previewFile={data} getFields={getFields} fields={mappingFields}
        parseXlsx={parseXlsx} isFetch={isFetchFields}/>)
      : (isUploading ? <div>loading...</div> : <div></div>)
    const step1Class = `alert ${status > 400 ? 'alert-danger' : 'alert-info'} ${this.state.uploadStep1.length ? '' : 'hide'}`
    return (
      <div className={classes.tempView}>
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <div className={step1Class}>{this.state.uploadStep1}</div>
          <form encType='multipart/form-data' className='form-inline'>
            <div className='form-group' style={{paddingRight: 10}}>
              <input type='file' onChange={::this.handleFile} className='form-control'/>
            </div>
            <button type='button' onClick={::this.handleSubmit} className='btn btn-primary'>Upload</button>
            {' '}
            <button type='button' onClick={::this.handleGetTemplate} className='btn btn-info'>Chọn mẫu</button>
          </form>
        </div>
        <div>
          {mappingView}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, manageData)(Index)
