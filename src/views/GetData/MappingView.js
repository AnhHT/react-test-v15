import React, {Component, PropTypes} from 'react'
import MessageDialog from '../../components/Message/MessageDialog'
import CardContainer from './CardContainer'
import MappingForm from './MappingForm'
import {CallbackType} from './CallbackType'

const EMPTY_VAL = 'EMPTY_SLOT'
const getHeaderAddress = (columns, idx) => {
  if (idx > -1 && idx < columns.length) {
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
    this.handleCallback = this.handleCallback.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.state = {
      message: '?',
      modalIsOpen: false,
      selectedFieldsObject: props.previewFile.Column.map((item) => {
        return {Id: item.FieldId, Name: item.FieldName, mappingObject: {
          ObjectType: item.ObjectType,
          HasCalculateForOffice: item.HasCalculateForOffice,
          CalculateType: item.CalculateType,
          ObjectNameType: item.ObjectNameType
        }}
      })
    }
  }

  componentWillMount () {
    this.props.getFields()
  }

  hideModal () {
    this.setState({modalIsOpen: false})
  }

  handleCallback (callbackType, callbackResult) {
    switch (callbackType) {
      case CallbackType.AUTO_COMPLETE_CHANGE:
        this.setState({selectedFieldsObject: [...callbackResult.selectedFieldsObject]})
        break
      case CallbackType.CARD_CHANGE:
        console.log(callbackResult)
        break
      case CallbackType.SAVE_FORM:
        break
      case CallbackType.VALIDATE_ERROR:
        this.setState({message: callbackResult, modalIsOpen: true})
        break
      default:
        break
    }

    // let {formField, cards, selectedFields} = this.state
    // if (!selectedFields || !selectedFields.length) {
    //   this.setState({message: 'Hãy chọn mapping-field !', modalIsOpen: true})
    //   return
    // }

    // let {previewFile} = this.props
    // let headers = previewFile.dataHeader[formField.headerIndex]
    // let objectMapAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_A_COL_ID))
    // let objectTimeAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_C_COL_ID))
    // let tempAddr = getHeaderAddress(headers.Columns, getCardIndex(cards, DEFAULT_B_COL_ID))
    // if (objectMapAddr === EMPTY_VAL || objectTimeAddr === EMPTY_VAL || tempAddr === EMPTY_VAL) {
    //   this.setState({message: 'Vị trí của header chưa đúng !', modalIsOpen: true})
    //   return
    // }

    // let objectMap = {
    //   col: objectMapAddr,
    //   coldb: 'Đối tượng'
    // }

    // let objectTime = {
    //   col: objectTimeAddr,
    //   coldb: 'Thời gian'
    // }

    // let map = []
    // selectedFields.split(',').map((item) => {
    //   map = [...map, {
    //     col: tempAddr,
    //     coldb: 'C',
    //     FieldId: parseInt(item),
    //     ObjectType: formField.objectType,
    //     HasCalculateForOffice: formField.hasCalculateForOffice,
    //     CalculateType: formField.calculateType,
    //     ObjectNameType: formField.objectNameType
    //   }]
    // })

    // let temp = {
    //   TemplateId: formField.templateId,
    //   FileDataName: previewFile.FileDataName,
    //   HeaderIndex: formField.headerIndex,
    //   DataIndex: formField.dataIndex,
    //   FooterIndex: formField.footerIndex,
    //   Map: map,
    //   ObjectMap: objectMap,
    //   ObjectTime: objectTime,
    //   HasCalculateForOffice: formField.hasCalculateForOffice,
    //   ObjectType: formField.objectType,
    //   CalculateType: formField.calculateType,
    //   ObjectNameType: formField.objectNameType
    // }

    // console.log(temp)
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

    const randomIdx = Math.round((previewFile.dataHeader.length / 2) + 1)
    const maxSelectedValues = previewFile.dataHeader[randomIdx].Columns.length
    const previewFileObj = {
      Id: previewFile.Id,
      HeaderIndex: previewFile.HeaderIndex,
      DataIndex: previewFile.DataIndex,
      FooterIndex: previewFile.FooterIndex,
      ObjectType: previewFile.ObjectType,
      MaxSelectedValues: maxSelectedValues,
      SelectedValues: previewFile.Column
    }

    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <MappingForm fieldList={fieldList} previewFileObj={previewFileObj} callback={this.handleCallback}/>
        </div>
        <CardContainer key={previewFile.Id} rows={previewFile.dataHeader} maxSelectedValues={maxSelectedValues}
          selectedFields={this.state.selectedFieldsObject} callback={this.handleCallback}
          selectedColumns={previewFile.Column}/>
      </div>
    )
  }
}
