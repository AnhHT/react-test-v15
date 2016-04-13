import React, {Component, PropTypes} from 'react'
import MappingView from './MappingView'
import {actions as manageData} from '../../redux/modules/Todos'
import {connect} from 'react-redux'
import classes from './DataView.scss'

const mapStateToProps = (state) => ({
  isUploading: state.todo.isUploading,
  isUploaded: state.todo.isUploaded,
  isFetchFields: state.todo.isFetchFields,
  isFetchingFields: state.todo.isFetchingFields,
  data: state.todo.myCollection,
  mappingFields: state.todo.mappingFields
})

export default class DataView extends Component {
  static propTypes = {
    data: PropTypes.object,
    isUploading: PropTypes.bool,
    isUploaded: PropTypes.bool,
    uploadFile: PropTypes.func,
    parseXlsx: PropTypes.func,
    mappingFields: PropTypes.array,
    getFields: PropTypes.func,
    isFetchFields: PropTypes.bool
  };

  constructor (props) {
    super(props)
    this.state = {
      fileData: null
    }
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
    const data = this.props.isUploaded ? (<MappingView key={key} previewFile={this.props.data}
      getFields={this.props.getFields} fields={this.props.mappingFields} parseXlsx={this.props.parseXlsx}
      isFetch={this.props.isFetchFields}/>) : (this.props.isUploading ? <div>loading...</div> : <div></div>)
    return (
      <div className={classes.tempView}>
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form encType='multipart/form-data' className='form-inline'>
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
