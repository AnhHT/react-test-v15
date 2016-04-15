import React, {Component, PropTypes} from 'react'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {CallbackType} from './Constant'
import MappingCard from './MappingCard'
import MappingCardExt from './MappingCardExt'
import {findIndex} from 'lodash'

@DragDropContext(HTML5Backend)
export default class MappingCardContainer extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired,
    cards: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.handleCallback = this.handleCallback.bind(this)
  }

  moveCard (dragIndex, hoverIndex) {
    this.props.callback(CallbackType.CARD_CHANGE, {
      dragIndex: dragIndex,
      hoverIndex: hoverIndex
    })
  }

  handleCallback (obj) {
    let cards = this.props.cards
    let index = findIndex(cards, {Id: obj.Id})
    cards = [...cards.slice(0, index), obj, ...cards.slice(index + 1)]
    this.props.callback(CallbackType.CARD_PROPERTIES_UPDATED, cards)
  }

  render () {
    const { rows, cards } = this.props
    return (
      <div className='table-responsive'>
        <table className='table table-hover'>
          <thead>
            <tr>
              <th width='15'></th>
              {cards.map((test, i) =>
                <th width='150'>
                  <MappingCardExt cardObj={test} key={i} callback={this.handleCallback}/>
                </th>
              )}
            </tr>
            <tr>
              <th width='15'>STT</th>
              {cards.map((item, i) =>
                <th width='150' style={{opacity: item.Id === -1 ? 0.5 : 1}}>
                  <MappingCard key={i} id={i} index={i} text={item.Name} moveCard={this.moveCard} />
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
