import React, {Component, PropTypes} from 'react'
import Card from './Card'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

@DragDropContext(HTML5Backend)
export default class CardContainer extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    moveCard: PropTypes.func.isRequired
  }

  render () {
    const { rows, cards, moveCard } = this.props

    return (
      <div className='table-responsive'>
        <table className='table table-hover'>
          <thead>
            <tr>
              <td width='30'>STT</td>
              {cards.map((item, i) =>
                <th width='150'>
                  <Card key={i} id={i} index={i} text={item.value} moveCard={moveCard}/>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
          {rows.map((row) =>
            <tr key={row.Id}>
              <td>{row.Id}</td>
              {row.Columns.map((cell) =>
                <td colSpan={cell.ColSpan} rowSpan={cell.Rowspan}>{cell.value}</td>
               )}
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }
}
