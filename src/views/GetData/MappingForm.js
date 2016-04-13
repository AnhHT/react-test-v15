import React, {Component, PropTypes} from 'react'
import Select from 'react-select'

export default class MappingForm extends Component {
  static propTypes = {
    formField: PropTypes.object,
    fieldList: PropTypes.array,
    selectedFields: PropTypes.string,
    handleCheckBoxChange: PropTypes.func.isRequired,
    handleSelectChange: PropTypes.func.isRequired
  }

  render () {
    const {formField, fieldList, selectedFields, handleCheckBoxChange, handleSelectChange} = this.props
    const calculationSection = formField.hasCalculateForOffice ? (
      <div className='radio'>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='0'
            checked={formField.calculateType === 0 ? 'true' : ''}/>Tính tổng
        </label>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='1'
            checked={formField.calculateType === 1 ? 'true' : ''}/>Tính trung bình
        </label>
      </div>
    ) : ''

    return (
      <div>
        <div className='radio'>
          <label className='radio-inline'>
            <input type='radio' name='objectType' value='0'
              checked={formField.objectType === 0 ? 'true' : ''}/>Đơn vị
          </label>
          <label className='radio-inline'>
            <input type='radio' name='objectType' value='1'
              checked={formField.objectType === 1 ? 'true' : ''}/>Cá nhân
          </label>
        </div>
        <div className='checkbox'>
          <label>
            <input type='checkbox' name='hasCalculateForOffice'
              checked={formField.hasCalculateForOffice ? 'true' : ''}
              onChange={handleCheckBoxChange} />Có tổng hợp vào đơn vị ?
          </label>
        </div>
        {calculationSection}
        <div className='radio'>
          <label className='radio-inline'>
            <input type='radio' name='objectNameType' value='0'
              checked={formField.objectNameType === 0 ? 'true' : ''}/>Tự động
          </label>
          <label className='radio-inline'>
            <input type='radio' name='objectNameType' value='1'
              checked={formField.objectNameType === 1 ? 'true' : ''}/>Manual
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
              <input type='text' value={formField.headerIndex} name='headerIndex'
                className='form-control'/>
            </div>
            <div className='col-xs-6 col-sm-4'>
              <input type='text' value={formField.dataIndex} name='dataIndex'
                className='form-control'/>
            </div>
            <div className='col-xs-6 col-sm-4'>
              <input type='text' value={formField.footerIndex} name='footerIndex'
                className='form-control'/>
            </div>
          </div>
        </div>
        <div className='form-group'>
          <Select multi simpleValue value={selectedFields} placeholder='Chọn field'
            options={fieldList} onChange={handleSelectChange} />
        </div>
      </div>
    )
  }
}
