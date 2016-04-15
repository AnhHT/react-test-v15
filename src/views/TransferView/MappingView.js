import React, {Component, PropTypes} from 'react'
import MessageDialog from '../../components/Message/MessageDialog'
import MappingCardContainer from './MappingCardContainer'
import MappingForm from './MappingForm'
import {CallbackType, DefaultMappingObj} from './Constant'
import update from 'react/lib/update'
import {find, filter} from 'lodash'

const EMPTY_VAL = 'EMPTY_SLOT'
const DEFAULT_A_COL_ID = -999
const DEFAULT_C_COL_ID = -997
const DEFAULT_CARD = [{Name: 'Đối tượng', Id: DEFAULT_A_COL_ID, MappingObject: DefaultMappingObj},
  {Name: 'Thời Gian', Id: DEFAULT_C_COL_ID, MappingObject: DefaultMappingObj}]

const getCards = (selectedFields, data) => {
  const randomIdx = Math.round((data.length / 2) + 1)
  const maxSelectedValues = data[randomIdx].Columns.length
  let cards = [...DEFAULT_CARD, ...selectedFields]
  if (cards.length < maxSelectedValues) {
    for (let i = cards.length; i < maxSelectedValues; i++) {
      cards = [...cards, {Name: EMPTY_VAL, Id: -1, MappingObject: DefaultMappingObj}]
    }
  }

  return cards
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
    this.handleCallback = this.handleCallback.bind(this)
    this.hideModal = this.hideModal.bind(this)
    const selectedFields = props.previewFile.Column.map((item) => {
      return {Id: item.FieldId, Name: item.FieldName, MappingObject: {
        HasCalculateForOffice: item.HasCalculateForOffice,
        CalculateType: item.CalculateType,
        ObjectNameType: item.ObjectNameType
      }}
    })

    this.state = {
      message: '?',
      modalIsOpen: false,
      selectedFieldsObject: selectedFields,
      cards: getCards(selectedFields, props.previewFile.dataHeader)
    }
  }

  componentWillMount () {
    this.props.getFields()
  }

  hideModal () {
    this.setState({modalIsOpen: false})
  }

  handleCallback (callbackType, callbackResult) {
    const {previewFile} = this.props.previewFile
    switch (callbackType) {
      case CallbackType.AUTO_COMPLETE_CHANGE:
        this.setState({selectedFieldsObject: [...callbackResult.selectedFieldsObject],
            cards: getCards(callbackResult.selectedFieldsObject, previewFile.dataHeader)
          }, () => {
          console.log('Selected fields >>>', this.state.selectedFieldsObject)
          console.log('Mapping card >>>', this.state.cards)
        })
        break
      case CallbackType.CARD_CHANGE:
        const dragCard = this.state.cards[callbackResult.dragIndex]
        this.setState(update(this.state, {
          cards: {
            $splice: [
              [callbackResult.dragIndex, 1],
              [callbackResult.hoverIndex, 0, dragCard]
            ]
          }
        }), () => {
          console.log('Mapping card >>>', this.state.cards)
        })
        break
      case CallbackType.VALIDATE_ERROR:
        this.setState({message: callbackResult, modalIsOpen: true})
        break
      case CallbackType.CARD_PROPERTIES_UPDATED:
        this.setState({cards: [...callbackResult]})
        break
      case CallbackType.SAVE_FORM:
        console.log('Selected fields >>>', this.state.selectedFieldsObject)
        console.log('Mapping card >>>', this.state.cards)
        console.log('Form data >>>', callbackResult)
        let cards = this.state.cards
        let headers = previewFile.dataHeader[callbackResult.headerIndex]
        let tempArr = []
        for (let i = 0; i < cards.length; i++) {
          let card = cards[i]
          let col = headers.Columns[i]
          tempArr = [...tempArr, {
            FieldId: card.Id,
            col: col.Address,
            ObjectType: callbackResult.ObjectType,
            HasCalculateForOffice: card.HasCalculateForOffice,
            CalculateType: card.CalculateType,
            ObjectNameType: card.ObjectNameType
          }]
        }
        const objectMapAddr = find(tempArr, {FieldId: DEFAULT_A_COL_ID}).col
        const objectTimeAddr = find(tempArr, {FieldId: DEFAULT_C_COL_ID}).col
        if (objectMapAddr === EMPTY_VAL || objectTimeAddr === EMPTY_VAL) {
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

        let map = filter(tempArr, (item) => {
          return item.FieldId > 0
        })

        let temp = {
          TemplateId: callbackResult.templateId,
          FileDataName: previewFile.FileDataName,
          HeaderIndex: callbackResult.headerIndex,
          DataIndex: callbackResult.dataIndex,
          FooterIndex: callbackResult.footerIndex,
          Map: map,
          ObjectMap: objectMap,
          ObjectTime: objectTime
        }

        console.log(temp)
        break
      default:
        break
    }
    // this.props.parseXlsx(temp)
  }

  render () {
    const { isFetch, fields, previewFile } = this.props
    let fieldList = []
    if (isFetch) {
      fieldList = fields.map((item) => {
        return {label: item.Name, value: `${item.Id}`, Id: item.Id, Name: item.Name}
      })
    }

    const previewFileObj = {
      Id: previewFile.Id,
      HeaderIndex: previewFile.HeaderIndex,
      DataIndex: previewFile.DataIndex,
      FooterIndex: previewFile.FooterIndex,
      ObjectType: previewFile.ObjectType,
      SelectedFieldsObject: this.state.selectedFieldsObject
    }

    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <MappingForm fieldList={fieldList} previewFileObj={previewFileObj} callback={this.handleCallback}/>
        </div>
        <MappingCardContainer key={previewFile.Id} rows={previewFile.dataHeader}
          callback={this.handleCallback} cards={this.state.cards}/>
      </div>
    )
  }
}
