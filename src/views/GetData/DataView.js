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
  mappingHeader: state.todo.mappingHeader,
  data: state.todo.myCollection
})

export default class DataView extends Component {
  static propTypes = {
    data: PropTypes.object,
    mappingHeader: PropTypes.object,
    isFetchingHeader: PropTypes.bool,
    isFetchHeader: PropTypes.bool,
    isUploading: PropTypes.bool,
    isUploaded: PropTypes.bool,
    uploadFile: PropTypes.func,
    getMappingHeader: PropTypes.func,
    parseXlsx: PropTypes.func
  };

  constructor (props) {
    super(props)
    this.state = {
      fileData: null
    }
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
    const data = this.props.isUploaded ? (<CardContainer key={key} previewFile={this.props.data}
      gHeader={this.props.getMappingHeader} headers={this.props.mappingHeader} parseXlsx={this.props.parseXlsx}
      isFetch={this.props.isFetchHeader}/>) : (this.props.isUploading ? <div>loading...</div> : <div></div>)
    return (
      <div className={classes.tempView}>
        <div style={{paddingBottom: 10, paddingTop: 10}}>
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
