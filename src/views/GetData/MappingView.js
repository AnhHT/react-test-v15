import React, {Component, PropTypes} from 'react'
import update from 'react/lib/update'
import MessageDialog from '../../components/Message/MessageDialog'
import CardContainer from './CardContainer'
import MappingForm from './MappingForm'

const EMPTY_VAL = 'EMPTY_SLOT'
const DEFAULT_A_COL_ID = -999
const DEFAULT_B_COL_ID = -998
const DEFAULT_C_COL_ID = -997
const DEFAULT_CARD = [{value: 'Đối tượng', Id: DEFAULT_A_COL_ID}, {value: 'Thời Gian', Id: DEFAULT_C_COL_ID}]

const getFieldsName = (fieldList, selectedFields) => {
  let temp = ''
  for (let i = 0; i < fieldList.length; i++) {
    if (selectedFields.indexOf(`${fieldList[i].Id}`) > -1) {
      temp = `${temp} ${fieldList[i].Name} | `
    }
  }

  return temp.substring(0, temp.length - 2)
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
  if (idx > -1 && idx < columns.length) {
    return columns[idx].Address
  }

  return EMPTY_VAL
}

const validateForm = (formField) => {
  let errors = []
  if (formField.headerIndex < 1) {
    errors = [...errors, 'Chưa chọn vị trí của header !']
  }

  if (formField.dataIndex <= formField.headerIndex) {
    errors = [...errors, 'Chưa chọn vị trí của dữ liệu !']
  }

  if (formField.footerIndex !== 0 && formField.footerIndex <= formField.dataIndex) {
    errors = [...errors, 'Chưa chọn vị trí kết thúc dữ liệu !']
  }

  return errors
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
      cards: [...DEFAULT_CARD],
      selectedFields: [],
      selectedFieldsName: [],
      formField: {
        headerIndex: this.props.previewFile.HeaderIndex,
        dataIndex: this.props.previewFile.DataIndex,
        footerIndex: this.props.previewFile.FooterIndex,
        templateId: this.props.previewFile.Id,
        hasCalculateForOffice: this.props.previewFile.HasCalculateForOffice,
        objectNameType: this.props.previewFile.ObjectNameType,
        objectType: this.props.previewFile.ObjectType,
        calculateType: this.props.previewFile.CalculateType
      },
      message: '?',
      modalIsOpen: false
    }
  }

  componentWillMount () {
    this.props.getFields()
    const {previewFile} = this.props
    let {cards} = this.state
    let tempIdx = Math.round((previewFile.dataHeader.length / 2) + 1)
    let temp = previewFile.dataHeader[tempIdx].Columns.length
    if (cards.length < temp) {
      for (let i = cards.length; i < temp; i++) {
        cards = [...cards, {value: EMPTY_VAL, Id: -1}]
      }

      this.setState({cards: [...cards]})
    }
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
    let temp = e.target.value
    if (!temp || !temp.length) {
      temp = 0
    }

    this.setState({formField: {...this.state.formField,
        [e.target.name]: parseInt(temp)
    }})
  }

  hideModal () {
    this.setState({modalIsOpen: false})
  }

  handleSelectChange (value) {
    this.setState({ selectedFields: value }, () => {
      const { fields } = this.props
      let temp = {value: getFieldsName(fields, this.state.selectedFields), Id: DEFAULT_B_COL_ID}
      let cards = this.state.cards
      cards = [...cards.slice(0, 2), temp, ...cards.slice(3, cards.length)]
      this.setState({cards: cards})
    })
  }

  handleCheckBoxChange (e) {
    this.setState({formField: {...this.state.formField,
      hasCalculateForOffice: (e.target.checked ? 1 : 0)
    }})
  }

  saveMappingTemplate (e) {
    let {formField, cards, selectedFields} = this.state
    if (!selectedFields || !selectedFields.length) {
      this.setState({message: 'Hãy chọn mapping-field !', modalIsOpen: true})
      return
    }

    let {previewFile} = this.props
    let errors = validateForm(formField)
    if (errors.length) {
      let msg = errors.join(',')
      this.setState({message: msg, modalIsOpen: true})
      return
    }

    let headers = previewFile.dataHeader[formField.headerIndex]
    let objectMapAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_A_COL_ID))
    let objectTimeAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_C_COL_ID))
    let tempAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_B_COL_ID))
    if (objectMapAddr === EMPTY_VAL || objectTimeAddr === EMPTY_VAL || tempAddr === EMPTY_VAL) {
      this.setState({message: 'Vị trí của header chưa đúng !', modalIsOpen: true})
      return
    }

    let objectMap = {
      col: objectMapAddr,
      coldb: 'Đối tượng'
    }

    let objectTime = {
      col: objectTimeAddr,
      coldb: 'Thời gian'
    }

    let map = []
    selectedFields.split(',').map((item) => {
      map = [...map, {
        col: tempAddr,
        coldb: 'C',
        FieldId: parseInt(item),
        ObjectType: formField.objectType,
        HasCalculateForOffice: formField.hasCalculateForOffice,
        CalculateType: formField.calculateType,
        ObjectNameType: formField.objectNameType
      }]
    })

    let temp = {
      TemplateId: formField.templateId,
      FileDataName: previewFile.FileDataName,
      HeaderIndex: formField.headerIndex,
      DataIndex: formField.dataIndex,
      FooterIndex: formField.footerIndex,
      Map: map,
      ObjectMap: objectMap,
      ObjectTime: objectTime,
      HasCalculateForOffice: formField.hasCalculateForOffice,
      ObjectType: formField.objectType,
      CalculateType: formField.calculateType,
      ObjectNameType: formField.objectNameType
    }

    console.log(temp)
    // this.props.parseXlsx(temp)
  }

  render () {
    const { isFetch, fields, previewFile } = this.props
    let fieldList = []
    if (isFetch) {
      fieldList = fields.map((item) => {
        return {label: item.Name, value: `${item.Id}`}
      })
    }

    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form onSubmit={this.saveMappingTemplate} onChange={this.handleInputIndex}>
            <MappingForm formField={this.state.formField} fieldList={fieldList}
              selectedFields={this.state.selectedFields} handleInputIndex={this.handleInputIndex}
              handleCheckBoxChange={this.handleCheckBoxChange} handleSelectChange={this.handleSelectChange} />
            <button type='button' onClick={this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
          </form>
        </div>
        <CardContainer key={previewFile.Id} rows={previewFile.dataHeader} cards={this.state.cards}
          moveCard={this.moveCard}/>
      </div>
    )
  }
}
