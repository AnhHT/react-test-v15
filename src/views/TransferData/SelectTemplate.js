import React, { Component, PropTypes} from 'react'
import {actions as manageFiles} from '../../redux/modules/fileTodo'
import {connect} from 'react-redux'

const mapStateToProps = (state) => ({
  isFetch: state.fileTodo.isFetch,
  isFetching: state.fileTodo.isFetching,
  files: state.fileTodo.files,
  previewLayout: state.fileTodo.previewLayout,
  isFetchLayout: state.fileTodo.isFetchLayout,
  isFetchingLayout: state.fileTodo.isFetchingLayout
})

class SelectTemplate extends Component {
  static propTypes = {
    files: PropTypes.array,
    getFiles: PropTypes.func,
    isFetch: PropTypes.bool,
    previewLayout: PropTypes.object,
    getPreviewLayout: PropTypes.func,
    isFetchLayout: PropTypes.bool,
    saveSelectedFile: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.pickTemplate = this.pickTemplate.bind(this)
    this.state = {
      selectedFile: {
        fileName: '',
        layout: {}
      }
    }
  }

  componentWillMount () {
    this.props.getFiles()
  }

  handleClick (e) {
    e.preventDefault()
    let index = parseInt(e.target.getAttribute('data-index'))
    let fileName = this.props.files[index]
    let selectedFileName = this.state.selectedFile.fileName
    if (!selectedFileName.length || selectedFileName !== fileName) {
      this.props.getPreviewLayout(fileName)
      this.setState({
        selectedFile: {
          fileName: fileName,
          layout: {}
        }
      })
    }
  }

  pickTemplate (e) {
    e.preventDefault()
    let selectedFileName = this.state.selectedFile.fileName
    console.log(selectedFileName)
    if (selectedFileName.length) {
      this.setState({
        selectedFile: {
          ...this.state.selectedFile,
          layout: this.props.previewLayout
        }
      }, () => {
        this.props.saveSelectedFile(this.state.selectedFile)
      })
    }
  }

  render () {
    const { files, isFetch, isFetchLayout, previewLayout } = this.props
    const tempComponent = isFetch ? files.map((item, i) =>
      <span data-index={i} key={i} onClick={this.handleClick}>{item}</span>) : <span>Loading..</span>
    const layout = isFetchLayout ? (
      <div>
        <table>
          <thead>
            <tr>
            {previewLayout.Columns.map((t) => <th width='100'>{t.value}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
            {previewLayout.Columns.map((t) => <td>Lorenasdas</td>)}
            </tr>
          </tbody>
        </table>
        <div>
          <button onClick={this.pickTemplate} type='button'>Select</button>
        </div>
      </div>
    ) : new Map()

    return (
      <div>
      {tempComponent}
      {layout}
      </div>
    )
  }
}

export default connect(mapStateToProps, manageFiles)(SelectTemplate)
