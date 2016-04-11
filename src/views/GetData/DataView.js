import React, {Component, PropTypes} from 'react'
import CardContainer from './CardContainer'
import {actions as manageData} from '../../redux/modules/Todos'
import {connect} from 'react-redux'
import classes from './DataView.scss'
import Select from 'react-select'

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
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.state = {
      fileData: null,
      fieldList: [],
      value: []
    }
  }

  componentWillMount () {
    this.props.getFields()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.isFetchFields) {
      let temp = []
      temp = nextProps.mappingFields.map((item) => {
        return {label: item.Name, value: `${item.Id}`, ...item}
      })

      this.setState({fieldList: temp})
    }
  }

  handleSelectChange (value) {
    this.setState({ value: value })
  }

  handleSubmit (e) {
    e.preventDefault()
    if (this.state.fileData) {
      this.props.uploadFile(this.state.fileData)
    }
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
    const data = this.props.isUploaded ? (<CardContainer key={key} previewFile={this.props.data}
      gHeader={this.props.getMappingHeader} headers={this.props.mappingHeader} parseXlsx={this.props.parseXlsx}
      isFetch={this.props.isFetchHeader}/>) : (this.props.isUploading ? <div>loading...</div> : <div></div>)
    return (
      <div className={classes.tempView}>
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form encType='multipart/form-data'>
            <div className='form-group'>
              <Select multi simpleValue value={this.state.value} placeholder='Select field'
                options={this.state.fieldList} onChange={this.handleSelectChange} />
            </div>
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
