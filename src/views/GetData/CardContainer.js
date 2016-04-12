import React, {Component, PropTypes} from 'react'
import update from 'react/lib/update'
import Card from './Card'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import MessageDialog from '../../components/Message/MessageDialog'
import Select from 'react-select'

const EMPTY_VAL = '????'
const DEFAULT_CARD = [{value: 'Đối tượng'}, {value: 'Thời Gian'}]

const getFieldsName = (fieldList, selectedFields) => {
  let temp = fieldList.filter((item) => {
    return selectedFields.indexOf(`${item.Id}`) > -1
  })

  temp = temp.map((item) => {
    return `${item.Name} | `
  }).join('')

  return temp.substring(0, temp.length - 2)
}

const getCards = (fields, selectedFields, dataHeader) => {
  let cards = [...DEFAULT_CARD, {value: getFieldsName(fields, selectedFields)}]
  let tempIdx = Math.round((dataHeader.length / 2) + 1)
  let temp = dataHeader[tempIdx].Columns.length
  if (cards.length < temp) {
    for (let i = cards.length; i < temp; i++) {
      cards = [...cards, {value: EMPTY_VAL}]
    }
  }

  return cards
}

@DragDropContext(HTML5Backend)
export default class CardContainer extends Component {
  static propTypes = {
    previewFile: PropTypes.object,
    getFields: PropTypes.func,
    fields: PropTypes.array,
    isFetch: PropTypes.bool,
    parseXlsx: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.handleInputIndex = this.handleInputIndex.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this)
    this.state = {
      cards: [],
      headerIndex: this.props.previewFile.HeaderIndex,
      dataIndex: this.props.previewFile.DataIndex,
      footerIndex: this.props.previewFile.FooterIndex,
      message: '?',
      modalIsOpen: false,
      selectedFields: [],
      isShownCalculation: false
    }
  }

  componentWillMount () {
    this.props.getFields()
  }

  moveCard (dragIndex, hoverIndex) {
    const { cards } = this.state
    const dragCard = cards[dragIndex]
    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard]
        ]
      }
    }))
  }

  handleInputIndex (e) {
    this.setState({[e.target.name]: parseInt(e.target.value)})
  }

  hideModal () {
    this.setState({modalIsOpen: false})
  }

  handleSelectChange (value, text) {
    this.setState({ selectedFields: value }, () => {
      const { fields, previewFile } = this.props
      this.setState({cards: [...getCards(fields, this.state.selectedFields, previewFile.dataHeader)]})
    })
  }

  handleCheckBoxChange (e) {
    this.setState({isShownCalculation: e.target.checked})
  }

  saveMappingTemplate () {
    if (this.state.headerIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của header'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    if (this.state.dataIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của dữ liệu'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    if (this.state.footerIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của footer'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    let headers = this.props.previewFile.data[this.state.headerIndex]
    let cards = this.state.cards
    let map = []
    headers.Columns.map((item, idx) => {
      map = [...map, {
        col: item.Address,
        coldb: cards[idx].value
      }]
    })

    map = map.filter((item) => {
      return item.coldb !== EMPTY_VAL
    })

    let temp = {
      TemplateId: -1,
      FileDataName: this.props.previewFile.FileDataName,
      HeaderIndex: this.props.previewFile.data[this.state.headerIndex].Id,
      DataIndex: this.props.previewFile.data[this.state.dataIndex].Id,
      FooterIndex: this.props.previewFile.data[this.state.footerIndex].Id,
      Map: map,
      ObjectType: 0,
      HasCalculateForOffice: 0,
      CalculateType: 0,
      ObjectNameType: 0
    }

    console.log(temp)
    // this.props.parseXlsx(temp)
  }

  render () {
    const { isFetch, fields, previewFile } = this.props
    let rows = []
    if (previewFile) {
      rows = previewFile.dataHeader
    }

    let fieldList = []
    if (isFetch) {
      fieldList = fields.map((item) => {
        return {label: item.Name, value: `${item.Id}`, ...item}
      })
    }

    const tbl = this.state.selectedFields && this.state.selectedFields.length ? (
      <table className='table table-hover'>
        <thead>
          <tr>
            <td width='30'>STT</td>
            {this.state.cards.map((item, i) =>
              <th width='150'>
                <Card key={i} id={i} index={i} text={item.value} moveCard={this.moveCard}/>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
        {rows.map((row, idx) =>
          <tr key={idx}>
            <td>{idx + 1}</td>
            {row.Columns.map((cell) =>
              <td colSpan={cell.ColSpan} rowSpan={cell.Rowspan}>{cell.value}</td>
             )}
          </tr>
        )}
        </tbody>
      </table>
    ) : ''

    const calculationSection = this.state.isShownCalculation ? (
      <div className='radio'>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='sum'/>Tính tổng
        </label>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='avg'/>Tính trung bình
        </label>
      </div>
    ) : ''
    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form>
            <div className='radio'>
              <label className='radio-inline'>
                <input type='radio' name='objectType' value='dv'/>Đơn vị
              </label>
              <label className='radio-inline'>
                <input type='radio' name='objectType' value='cn'/>Cá nhân
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox' name='isCalculate' onChange={this.handleCheckBoxChange}/>Có tổng hợp vào đơn vị ?
              </label>
            </div>
            {calculationSection}
            <div className='radio'>
              <label className='radio-inline'>
                <input type='radio' name='objectName' value='sum'/>Tự động
              </label>
              <label className='radio-inline'>
                <input type='radio' name='objectName' value='avg'/>Manual
              </label>
            </div>
            <div className='form-group'>
              <Select multi simpleValue value={this.state.selectedFields} placeholder='Chọn field'
                options={fieldList} onChange={this.handleSelectChange} />
            </div>
            <div className='form-group'>
              <div className='row'>
                <div className='col-xs-6 col-sm-4'><label>Vị trí header</label></div>
                <div className='col-xs-6 col-sm-4'><label>Vị trí dữ liệu</label></div>
                <div className='col-xs-6 col-sm-4'><label>Vị trí kết thúc dữ liệu</label></div>
              </div>
              <div className='row'>
                <div className='col-xs-6 col-sm-4'>
                  <input type='text' value={this.state.headerIndex} name='headerIndex' onChange={this.handleInputIndex}
                    className='form-control'/>
                </div>
                <div className='col-xs-6 col-sm-4'>
                  <input type='text' value={this.state.dataIndex} name='dataIndex' onChange={this.handleInputIndex}
                    className='form-control'/>
                </div>
                <div className='col-xs-6 col-sm-4'>
                  <input type='text' value={this.state.footerIndex} name='footerIndex' onChange={this.handleInputIndex}
                    className='form-control'/>
                </div>
              </div>
            </div>
            <button type='button' onClick={::this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
          </form>
        </div>
        <div className='table-responsive'>
          {tbl}
        </div>
      </div>
    )
  }
}
