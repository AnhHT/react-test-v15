import React, {Component, PropTypes} from 'react'

export default class CardExt extends Component {
  static propTypes = {
    cardId: PropTypes.number.isRequired,
    cardProps: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      currentCard: {...props.cardProps}
    }
  }

  handleChange (e) {
    if (e.target.name.startsWith('hasCalculateForOffice')) {
      this.setState({currentCard: {...this.state.currentCard,
          [e.target.name]: (e.target.checked ? 1 : 0)}
      }, () => {
        console.log(this.state.currentCard)
      })
    } else {
      let temp = e.target.value
      if (!temp || !temp.length) {
        temp = 0
      }

      this.setState({currentCard: {...this.state.currentCard,
          [e.target.name]: parseInt(temp)}
      }, () => {
        console.log(this.state.currentCard)
      })
    }
  }

  render () {
    const cardId = this.props.cardId
    const disabled = cardId < 1

    return (
      <div style={{opacity: cardId < 1 ? 0.5 : 1}}>
        <form onChange={this.handleChange}>
          <div className='checkbox'>
            <label>
              <input type='checkbox' name='hasCalculateForOffice'
                disabled={disabled}/>Có tổng hợp vào đơn vị ?
            </label>
          </div>
          <div className='radio'>
            <label className='radio-inline'>
              <input type='radio' name='calculateType' value='0' disabled={disabled}/>Tính tổng
            </label>
            <label className='radio-inline'>
              <input type='radio' name='calculateType' value='1' disabled={disabled}/>Tính trung bình
            </label>
          </div>
          <div className='radio'>
            <label className='radio-inline'>
              <input type='radio' name='objectNameType' value='0' disabled={disabled}/>Tự động
            </label>
            <label className='radio-inline'>
              <input type='radio' name='objectNameType' value='1' disabled={disabled}/>Manual
            </label>
          </div>
        </form>
      </div>
    )
  }
}
