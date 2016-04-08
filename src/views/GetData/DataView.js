import React, {Component, PropTypes} from 'react'
import CardContainer from './CardContainer'
import {actions as manageData} from '../../redux/modules/Todos'
import {connect} from 'react-redux'
import classes from './DataView.scss'

const mapStateToProps = (state) => ({
  isUploading: state.todo.isUploading,
  isUploaded: state.todo.isUploaded,
  isFetchHeader: state.todo.isFetchHeader,
  isFetchingHeader: state.todo.isFetchingHeader,
  isFetchFields: state.todo.isFetchFields,
  isFetchingFields: state.todo.isFetchingFields,
  mappingHeader: state.todo.mappingHeader,
  data: state.todo.myCollection,
  mappingFields: state.todo.mappingFields
})

export default class DataView extends Component {
  static propTypes = {
    data: PropTypes.object,
    mappingHeader: PropTypes.object,
    mappingFields: PropTypes.array,
    isFetchingHeader: PropTypes.bool,
    isFetchHeader: PropTypes.bool,
    isUploading: PropTypes.bool,
    isUploaded: PropTypes.bool,
    uploadFile: PropTypes.func,
    getMappingHeader: PropTypes.func,
    parseXlsx: PropTypes.func,
    getFields: PropTypes.func,
    isFetchingFields: PropTypes.bool,
    isFetchFields: PropTypes.bool
  };

  constructor (props) {
    super(props)
    this.handleSelectedField = this.handleSelectedField.bind(this)
    this.handleRemoveField = this.handleRemoveField.bind(this)
    this.state = {
      fileData: null,
      selectedFields: [],
      fieldList: []
    }
  }

  componentWillMount () {
    this.props.getFields()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.isFetchFields) {
      this.setState({fieldList: nextProps.mappingFields})
    }
  }

  handleSelectedField (e) {
    let id = e.target.getAttribute('data-id')
    let value = e.target.getAttribute('data-value')
    let index = parseInt(e.target.getAttribute('data-index'))
    this.setState({
      selectedFields: [...this.state.selectedFields, {Id: id, Name: value}]
    }, () => {
      let temp = this.state.fieldList
      this.setState({
        fieldList: [...temp.slice(0, index), ...temp.slice(index + 1)]
      })
    })
  }

  handleRemoveField (e) {
    let id = e.target.getAttribute('data-id')
    let value = e.target.getAttribute('data-value')
    let index = parseInt(e.target.getAttribute('data-index'))
    this.setState({
      fieldList: [...this.state.fieldList, {Id: id, Name: value}]
    }, () => {
      let temp = this.state.selectedFields
      this.setState({
        selectedFields: [...temp.slice(0, index), ...temp.slice(index + 1)]
      })
    })
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.uploadFile(this.state.fileData)
  }

  handleFile (e) {
    let formData = new FormData()
    let file = e.target.files[0]
    formData.append('rawFile', file)
    this.setState({fileData: formData}, () => {
      console.log(this.state)
    })
  }

  render () {
    let key = 1
    const mappingFields = this.state.fieldList.map((item, idx) =>
      <span key={item.Id} className={classes['field-badge'] + ' badge'} data-index={idx}
        data-id={item.Id} data-value={item.Name} onClick={this.handleSelectedField}>{item.Name}
      </span>)
    const selectedFields = this.state.selectedFields.map((item, idx) =>
      <span key={item.Id} className={classes['field-badge'] + ' badge'} data-index={idx}
        data-id={item.Id} data-value={item.Name} onClick={this.handleRemoveField}>{item.Name}
      </span>)

    const data = this.props.isUploaded ? (<CardContainer key={key} previewFile={this.props.data}
      gHeader={this.props.getMappingHeader} headers={this.props.mappingHeader} parseXlsx={this.props.parseXlsx}
      isFetch={this.props.isFetchHeader}/>) : (this.props.isUploading ? <div>loading...</div> : <div></div>)
    return (
      <div className={classes.tempView}>
        <div style={{paddingBottom: 10, paddingTop: 10}}>
          <div>
            <div>
              <h3>Danh sách mapping</h3>
              <div>{mappingFields}</div>
            </div>
            <div>
              <h3>Đã chọn</h3>
              <div>{selectedFields}</div>
            </div>
          </div>
          <form className='form-inline' encType='multipart/form-data'>
            <div className='form-group' style={{paddingRight: 10}}>
              <input type='file' onChange={::this.handleFile} className='form-control'/>
            </div>
            <button type='button' onClick={::this.handleSubmit} className='btn btn-default'>Upload</button>
          </form>
        </div>
        <div>
          {data}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, manageData)(DataView)
