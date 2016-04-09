import React, {Component, PropTypes} from 'react'
import update from 'react/lib/update'
import Card from './Card'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import MessageDialog from '../../components/Message/MessageDialog'

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
      message: '?',
      modalIsOpen: false
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
    this.setState({modalIsOpen: false})
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
    const { cards } = this.state
    const rows = this.props.previewFile ? this.props.previewFile.dataHeader : new Map()
    return (
      <div>
        <MessageDialog modalIsOpen={this.state.modalIsOpen} message={this.state.message}
          hideModal={this.hideModal} />
        <div style={{paddingBottom: 10, paddingTop: 10, width: '50%'}}>
          <form>
            <div className='form-group'>
              <label>Email address</label>
              <input type='email' className='form-control' placeholder='Email' />
            </div>
            <div className='form-group'>
              <label>Password</label>
              <input type='password' className='form-control' placeholder='Password' />
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox' /> Check me out
              </label>
            </div>
            <button type='button' onClick={::this.saveMappingTemplate} className='btn btn-default'>Lưu Mapping</button>
          </form>
        </div>
        <div className='table-responsive'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <td width='30'>STT</td>
                {cards.map((item, i) => <th width='150'>
                  <Card key={i} id={i} index={i} text={item.value} moveCard={this.moveCard}/>
                </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) =>
                <tr key={idx}>
                  <td>{idx + 1}</td>
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
