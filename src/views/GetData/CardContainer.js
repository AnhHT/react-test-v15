import React, {Component, PropTypes} from 'react'
import update from 'react/lib/update'
import Card from './Card'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {CallbackType} from './CallbackType'
import CardExt from './CardExt'

const EMPTY_VAL = 'EMPTY_SLOT'
const DEFAULT_A_COL_ID = -999
const DEFAULT_C_COL_ID = -997
const DEFAULT_CARD = [{Name: 'Đối tượng', Id: DEFAULT_A_COL_ID}, {Name: 'Thời Gian', Id: DEFAULT_C_COL_ID}]

@DragDropContext(HTML5Backend)
export default class CardContainer extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    selectedFields: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired,
    maxSelectedValues: PropTypes.number.isRequired,
    selectedColumns: PropTypes.array
  }

  constructor (props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.state = {
      cards: []
    }
  }

  componentWillReceiveProps (nextProps) {
    const {selectedFields, maxSelectedValues} = nextProps
    let cards = [...DEFAULT_CARD, ...selectedFields]
    if (cards.length < maxSelectedValues) {
      for (let i = cards.length; i < maxSelectedValues; i++) {
        cards = [...cards, {Name: EMPTY_VAL, Id: -1}]
      }
    }

    this.setState({cards: [...cards]})
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
    }), () => {
      this.props.callback(CallbackType.CARD_CHANGE, this.state.cards)
    })
  }

  render () {
    const { rows } = this.props
    return (
      <div className='table-responsive'>
        <table className='table table-hover'>
          <thead>
            <tr>
              <th width='15'></th>
              {this.state.cards.map((test, i) =>
                <th width='150'>
                  <CardExt cardId={test.Id} key={i} cardProps={test.mappingObject}/>
                </th>
              )}
            </tr>
            <tr>
              <th width='15'>STT</th>
              {this.state.cards.map((item, i) =>
                <th width='150' style={{opacity: item.Id === -1 ? 0.5 : 1}}>
                  <Card key={i} id={i} index={i} text={item.Name} moveCard={this.moveCard} />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
          {rows.map((row) =>
            <tr key={row.Id}>
              <td>{row.Id}</td>
              {row.Columns.map((cell) =>
                <td colSpan={cell.ColSpan} rowSpan={cell.Rowspan} width='150' >{cell.value}</td>
               )}
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }
}
