import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import update from 'react/lib/update'
import MessageDialog from '../../components/Message/MessageDialog'
import CardContainer from './CardContainer'

const EMPTY_VAL = '????'
const DEFAULT_A_COL_ID = -999
const DEFAULT_B_COL_ID = -998
const DEFAULT_C_COL_ID = -997
const DEFAULT_CARD = [{value: 'Đối tượng', Id: DEFAULT_A_COL_ID}, {value: 'Thời Gian', Id: DEFAULT_C_COL_ID}]

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
  if (selectedFields && selectedFields.length) {
    let cards = [...DEFAULT_CARD, {value: getFieldsName(fields, selectedFields), Id: DEFAULT_B_COL_ID}]
    let tempIdx = Math.round((dataHeader.length / 2) + 1)
    let temp = dataHeader[tempIdx].Columns.length
    if (cards.length < temp) {
      for (let i = cards.length; i < temp; i++) {
        cards = [...cards, {value: EMPTY_VAL, Id: -1}]
      }
    }

    return cards
  }

  return DEFAULT_CARD
}

const getCardIndex = (cards, id) => {
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].Id === id) {
      return i
    }
  }

  return -1
}

const getHeaderAddress = (columns, idx) => {
  if (idx !== -1 && idx < columns.length) {
    return columns[idx].Address
  }

  return EMPTY_VAL
}

export default class MappingView extends Component {

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
    this.saveMappingTemplate = this.saveMappingTemplate.bind(this)
    this.state = {
      cards: [],
      headerIndex: this.props.previewFile.HeaderIndex,
      dataIndex: this.props.previewFile.DataIndex,
      footerIndex: this.props.previewFile.FooterIndex,
      templateId: this.props.previewFile.Id,
      message: '?',
      modalIsOpen: false,
      selectedFields: [],
      hasCalculateForOffice: false
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
    this.setState({hasCalculateForOffice: e.target.checked})
  }

  saveMappingTemplate () {
    let {headerIndex, dataIndex, footerIndex, templateId, cards
          , hasCalculateForOffice, selectedFields} = this.state
    let {previewFile} = this.props

    if (headerIndex < 1) {
      this.setState({message: 'Chưa chọn vị trí của header'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    if (dataIndex <= headerIndex) {
      this.setState({message: 'Chưa chọn vị trí của dữ liệu'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    if (footerIndex < 0) {
      this.setState({message: 'Chưa chọn vị trí của footer'}, () => {
        this.setState({modalIsOpen: true})
      })
      return
    }

    let headers = previewFile.dataHeader[headerIndex]
    let objectMap = {
      col: getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_A_COL_ID)),
      coldb: 'Đối tượng'
    }

    let objectTime = {
      col: getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_C_COL_ID)),
      coldb: 'Thời gian'
    }

    let tempAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_B_COL_ID))
    console.log(tempAddr)
    console.log(selectedFields)

    let map = []
    selectedFields.split(',').map((item) => {
      map = [...map, {
        col: tempAddr,
        coldb: 'C',
        FieldId: parseInt(item),
        ObjectType: 0,
        HasCalculateForOffice: hasCalculateForOffice,
        CalculateType: 0,
        ObjectNameType: 0
      }]
    })

    console.log(map)

    let temp = {
      TemplateId: templateId,
      FileDataName: previewFile.FileDataName,
      HeaderIndex: headerIndex,
      DataIndex: dataIndex,
      FooterIndex: footerIndex,
      Map: map,
      ObjectType: 0,
      HasCalculateForOffice: hasCalculateForOffice,
      CalculateType: 0,
      ObjectNameType: 0,
      ObjectMap: objectMap,
      ObjectTime: objectTime
    }

    console.log(temp)
    // this.props.parseXlsx(temp)
  }

  render () {
    const { isFetch, fields, previewFile } = this.props

    let fieldList = []
    if (isFetch) {
      fieldList = fields.map((item) => {
        return {label: item.Name, value: `${item.Id}`, ...item}
      })
    }

    const tblResponsive = this.state.selectedFields && this.state.selectedFields.length ? (
      <CardContainer key={previewFile.Id} rows={previewFile.dataHeader} cards={this.state.cards}
        moveCard={this.moveCard}/>) : ''

    const calculationSection = this.state.hasCalculateForOffice ? (
      <div className='radio'>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='0'/>Tính tổng
        </label>
        <label className='radio-inline'>
          <input type='radio' name='calculateType' value='1'/>Tính trung bình
        </label>
      </div>
    ) : ''

    const indiceSection = this.state.selectedFields && this.state.selectedFields.length ? (
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
    ) : ''

    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form>
            <div className='radio'>
              <label className='radio-inline'>
                <input type='radio' name='objectType' value='0'/>Đơn vị
              </label>
              <label className='radio-inline'>
                <input type='radio' name='objectType' value='1'/>Cá nhân
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox' name='hasCalculateForOffice'
                  onChange={this.handleCheckBoxChange}/>Có tổng hợp vào đơn vị ?
              </label>
            </div>
            {calculationSection}
            <div className='radio'>
              <label className='radio-inline'>
                <input type='radio' name='objectNameType' value='0'/>Tự động
              </label>
              <label className='radio-inline'>
                <input type='radio' name='objectNameType' value='1'/>Manual
              </label>
            </div>
            <div className='form-group'>
              <Select multi simpleValue value={this.state.selectedFields} placeholder='Chọn field'
                options={fieldList} onChange={this.handleSelectChange} />
            </div>
            {indiceSection}
            <button type='button' onClick={this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
          </form>
        </div>
        {tblResponsive}
      </div>
    )
  }
}
