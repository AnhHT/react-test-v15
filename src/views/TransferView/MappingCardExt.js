import React, {Component, PropTypes} from 'react'
import {isEqual} from 'lodash'

export default class MappingCardExt extends Component {
  static propTypes = {
    cardObj: PropTypes.object.isRequired,
    callback: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      currentCard: props.cardObj.MappingObject
    }
  }

  handleChange (e) {
    let temp = 0
    if (e.target.name.startsWith('HasCalculateForOffice')) {
      temp = e.target.checked ? 1 : 0
    } else {
      temp = e.target.value
      if (!temp || !temp.length) {
        temp = 0
      }

      temp = parseInt(temp)
    }

    const {cardObj, callback} = this.props
    this.setState({currentCard: {...this.state.currentCard,
        [e.target.name]: temp}
    }, () => {
      callback({
        MappingObject: {...this.state.currentCard},
        Id: cardObj.Id,
        Name: cardObj.Name
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props.cardObj, nextProps.cardObj)) {
      this.setState({currentCard: nextProps.cardObj.MappingObject})
    }
  }

  render () {
    const cardId = this.props.cardObj.Id
    const disabled = cardId < 1
    const calculationSection = this.state.currentCard.HasCalculateForOffice ? (
      <div className='radio'>
        <label className='radio-inline'>
          <input type='radio' name='CalculateType' value='0' disabled={disabled}
            checked={this.state.currentCard.CalculateType === 0 ? 'true' : ''}/>Tính tổng
        </label>
        <label className='radio-inline'>
          <input type='radio' name='CalculateType' value='1' disabled={disabled}
            checked={this.state.currentCard.CalculateType === 1 ? 'true' : ''}/>Tính trung bình
        </label>
      </div>
    ) : ''
    return (
      <div style={{opacity: cardId < 1 ? 0.5 : 1}}>
        <form onChange={this.handleChange}>
          <div className='checkbox'>
            <label>
              <input type='checkbox' name='HasCalculateForOffice' disabled={disabled}
                checked={this.state.currentCard.HasCalculateForOffice === 1 ? 'true' : ''}/>Có tổng hợp vào đơn vị ?
            </label>
          </div>
          {calculationSection}
          <div className='radio'>
            <label className='radio-inline'>
              <input type='radio' name='ObjectNameType' value='0' disabled={disabled}
                checked={this.state.currentCard.ObjectNameType === 0 ? 'true' : ''}/>Tự động
            </label>
            <label className='radio-inline'>
              <input type='radio' name='ObjectNameType' value='1' disabled={disabled}
                checked={this.state.currentCard.ObjectNameType === 1 ? 'true' : ''}/>Manual
            </label>
          </div>
        </form>
      </div>
    )
  }
}
