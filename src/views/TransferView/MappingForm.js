import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import {CallbackType, DefaultMappingObj} from './Constant'
import {find, findIndex, difference, split} from 'lodash'

const validateForm = (state) => {
  let errors = []
  if (!state.selectedFields || !state.selectedFields.length) {
    errors = [...errors, 'Hãy chọn mapping-field !']
  }

  if (state.headerIndex < 1) {
    errors = [...errors, 'Chưa chọn vị trí của header !']
  }

  if (state.dataIndex <= state.headerIndex) {
    errors = [...errors, 'Chưa chọn vị trí đọc dữ liệu !']
  }

  if (state.footerIndex !== 0 && state.footerIndex <= state.dataIndex) {
    errors = [...errors, 'Vị trí kết thúc phải lớn hơn vị trí đọc dữ liệu !']
  }

  return errors
}

export default class MappingForm extends Component {
  static propTypes = {
    fieldList: PropTypes.array,
    previewFileObj: PropTypes.object,
    callback: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.saveMappingTemplate = this.saveMappingTemplate.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.state = {
      selectedFields: props.previewFileObj.SelectedFieldsObject.map((item) => { return `${item.Id}` }),
      headerIndex: props.previewFileObj.HeaderIndex,
      dataIndex: props.previewFileObj.DataIndex,
      footerIndex: props.previewFileObj.FooterIndex,
      templateId: props.previewFileObj.Id,
      objectType: props.previewFileObj.ObjectType
    }
  }

  handleInputChange (e) {
    if (e.target.name === 'hasCalculateForOffice') {
      this.setState({hasCalculateForOffice: (e.target.checked ? 1 : 0)})
    } else {
      let temp = e.target.value
      if (!temp || !temp.length) {
        temp = 0
      }

      this.setState({[e.target.name]: parseInt(temp)})
    }
  }

  handleSelectChange (value) {
    const { fieldList, callback, previewFileObj } = this.props
    if (!value) {
      this.setState({selectedFields: []})
      callback(CallbackType.AUTO_COMPLETE_CHANGE, {
        selectedFields: [],
        selectedFieldsObject: []
      })
    } else {
      let currentValues = split(value, ',')
      let previousValues = split(this.state.selectedFields, ',')
      if (currentValues.length > (previewFileObj.MaxSelectedValues - 2)) {
        callback(CallbackType.VALIDATE_ERROR, 'Số lượng mapping-field không được vượt quá giới hạn bảng mẫu !')
        return
      }

      this.setState({ selectedFields: value })
      // 1: Add , 0: Remove
      let currentSelectedFields = previewFileObj.SelectedFieldsObject
      const currentAction = currentValues.length >= previousValues.length
      if (currentAction) {
        let diff = difference(currentValues, previousValues)
        let obj = find(fieldList, {value: diff[0]})
        currentSelectedFields = [...currentSelectedFields, {
          Id: obj.Id, Name: obj.Name, MappingObject: DefaultMappingObj
        }]
      } else {
        let diff = difference(previousValues, currentValues)
        let index = findIndex(currentSelectedFields, {Id: parseInt(diff[0])})
        currentSelectedFields = [...currentSelectedFields.slice(0, index), ...currentSelectedFields.slice(index + 1)]
      }

      callback(CallbackType.AUTO_COMPLETE_CHANGE, {
        selectedFields: value,
        selectedFieldsObject: currentSelectedFields
      })
    }
  }

  saveMappingTemplate (e) {
    const {callback} = this.props
    const errors = validateForm(this.state)
    if (errors.length) {
      callback(CallbackType.VALIDATE_ERROR, errors.join(','))
      return
    }

    callback(CallbackType.SAVE_FORM, this.state)
  }

  render () {
    const {fieldList} = this.props
    return (
      <form onSubmit={this.saveMappingTemplate} onChange={this.handleInputChange}>
        <div className='radio'>
          <label className='radio-inline'>
            <input type='radio' name='objectType' value='0'
              checked={this.state.objectType === 0 ? 'true' : ''}/>Đơn vị
          </label>
          <label className='radio-inline'>
            <input type='radio' name='objectType' value='1'
              checked={this.state.objectType === 1 ? 'true' : ''}/>Cá nhân
          </label>
        </div>
        <div className='form-group'>
          <div className='row'>
            <div className='col-xs-6 col-sm-4'><label>Vị trí header</label></div>
            <div className='col-xs-6 col-sm-4'><label>Vị trí dữ liệu</label></div>
            <div className='col-xs-6 col-sm-4'><label>Vị trí kết thúc dữ liệu</label></div>
          </div>
          <div className='row'>
            <div className='col-xs-6 col-sm-4'>
              <input type='text' value={this.state.headerIndex} name='headerIndex'
                className='form-control'/>
            </div>
            <div className='col-xs-6 col-sm-4'>
              <input type='text' value={this.state.dataIndex} name='dataIndex'
                className='form-control'/>
            </div>
            <div className='col-xs-6 col-sm-4'>
              <input type='text' value={this.state.footerIndex} name='footerIndex'
                className='form-control'/>
            </div>
          </div>
        </div>
        <div className='form-group'>
          <Select multi simpleValue value={this.state.selectedFields} placeholder='Chọn field'
            options={fieldList} onChange={this.handleSelectChange} />
        </div>
        <button type='button' onClick={this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
      </form>
    )
  }
}
