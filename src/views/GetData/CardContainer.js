import React, {Component, PropTypes} from 'react'
import update from 'react/lib/update'
import Card from './Card'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Modal from 'boron/DropModal'

const EMPTY_VAL = '????'

@DragDropContext(HTML5Backend)
export default class CardContainer extends Component {
  static propTypes = {
    previewFile: PropTypes.object,
    gHeader: PropTypes.func,
    headers: PropTypes.object,
    isFetch: PropTypes.bool,
    parseXlsx: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.onSelectHeaderIdx = this.onSelectHeaderIdx.bind(this)
    this.onSelectDataIdx = this.onSelectDataIdx.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.state = {
      cards: [],
      headerIndex: -1,
      dataIndex: -1,
      footerIndex: -1,
      message: '?'
    }
  }

  componentWillMount () {
    this.props.gHeader()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.isFetch) {
      this.setState({cards: [...nextProps.headers.layout.Columns]}, () => {
        let tempIdx = Math.round((this.props.previewFile.dataHeader.length / 2) + 1)
        let temp = this.props.previewFile.dataHeader[tempIdx].Columns.length
        let cardsLength = this.state.cards.length
        let cards = this.state.cards
        if (cardsLength < temp) {
          for (let i = cardsLength; i < temp; i++) {
            cards = [...cards, {value: EMPTY_VAL}]
          }

          this.setState({cards: [...cards]})
        }
      })
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

  onSelectHeaderIdx (e) {
    let idx = parseInt(e.target.value)
    this.setState({headerIndex: idx}, () => {
      console.log(this.state.headerIndex)
    })
  }

  onSelectDataIdx (e) {
    let idx = parseInt(e.target.value)
    this.setState({dataIndex: idx}, () => {
      console.log(this.state.dataIndex)
    })
  }

  hideModal () {
    this.refs.modal.hide()
  }

  saveMappingTemplate () {
    if (this.state.headerIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của header'}, () => {
        this.refs.modal.show()
      })
      return
    }

    if (this.state.dataIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của dữ liệu'}, () => {
        this.refs.modal.show()
      })
      return
    }

    if (this.state.footerIndex === -1) {
      this.setState({message: 'Chưa chọn vị trí của footer'}, () => {
        this.refs.modal.show()
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
    const { cards } = this.state
    const colSpan = cards.length + 2
    const rowHeader = this.props.previewFile ? this.props.previewFile.dataHeader : new Map()
    const rowFooter = this.props.previewFile ? this.props.previewFile.dataFooter : new Map()
    return (
      <div>
        <Modal ref='modal'>
          <div className='modal-header'>
            <button type='button' className='close' onClick={this.hideModal}>
              <span aria-hidden='true'>&times;</span>
            </button>
            <h4 className='modal-title'>Warning</h4>
          </div>
          <div className='modal-body'>
            <p>{this.state.message}</p>
          </div>
          <div className='modal-footer'>
            <button onClick={this.hideModal} type='button' className='btn btn-danger'>Close</button>
          </div>
        </Modal>
        <div style={{paddingBottom: 10, paddingTop: 10}}>
          <form className='form-inline'>
            <button type='button' onClick={::this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
          </form>
        </div>
        <div className='table-responsive'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th width='70'>Vị trí header</th>
                <th width='70'>Vị trí dữ liệu</th>
                {cards.map((item, i) => <th width='150'>
                  <Card key={i} id={i} index={i} text={item.value} moveCard={this.moveCard}/>
                </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rowHeader.map((row, idx) =>
                <tr key={idx}>
                  <td><input type='radio' name='headerIndex' onChange={this.onSelectHeaderIdx}
                    value={idx}/></td>
                  <td><input type='radio' name='dataIndex' onChange={this.onSelectDataIdx}
                    value={idx}/></td>
                    {row.Columns.map((cell, idx) =>
                      <td key={idx} colSpan={cell.ColSpan} rowSpan={cell.Rowspan}>{cell.value}</td>
                    )}
                </tr>
              )}
              <tr><td colSpan={colSpan}>...</td></tr>
              <tr><td colSpan={colSpan}>Vị trí footer</td></tr>
              {rowFooter.map((row, idx) =>
                <tr key={idx}>
                  <td colSpan='2'><input type='radio' name='footerIndex' onChange={this.onSelectHeaderIdx}
                    value={idx}/></td>
                    {row.Columns.map((cell, idx) =>
                      <td key={idx} colSpan={cell.ColSpan} rowSpan={cell.Rowspan}>{cell.value}</td>
                    )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
