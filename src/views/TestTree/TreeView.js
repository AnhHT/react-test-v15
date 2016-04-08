import React, { Component, PropTypes } from 'react'
import { actions as manageData } from '../../redux/modules/treeTodo'
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
  isFetching: state.treeTodo.isFetching,
  isFetch: state.treeTodo.isFetch,
  data: state.treeTodo.treeCollection
})

class CellItem extends Component {
  static propTypes = {
    orders: PropTypes.array,
    selectedVal: PropTypes.number,
    handleChange: PropTypes.func,
    rowIndex: PropTypes.number
  }

  render () {
    return (
      <select value={this.props.selectedVal} name='position'
        onChange={this.props.handleChange} data-index={this.props.rowIndex}>
        {this.props.orders.map((opt) => <option value={opt.OrderNo}>{opt.Text}</option>)}
      </select>
    )
  }
}

class Row extends Component {
  static propTypes = {
    item: PropTypes.object,
    counter: PropTypes.number,
    handleChange: PropTypes.func
  }

  render () {
    let multiple = (this.props.item.IdPath.match(new RegExp('.', 'g')) || []).length
    let dynamicStyle = {
      paddingLeft: (multiple * 5)
    }

    let item = this.props.item
    return (
      <tr>
        <td>{this.props.counter}</td>
        <td>
          <span style={dynamicStyle}>
            <CellItem orders={item.Orders} selectedVal={item.OrderNo}
              handleChange={this.props.handleChange} rowIndex={this.props.counter}/> - {item.Name}
          </span>
        </td>
        <td>{item.ShortName}</td>
        <td>{item.ParrentName}</td>
      </tr>
    )
  }
}

export default class TreeView extends Component {
  static propTypes = {
    data: PropTypes.object,
    isFetching: PropTypes.bool,
    isFetch: PropTypes.bool,
    getData: PropTypes.func,
    orderData: PropTypes.func
  };

  constructor (props) {
    super(props)
    this.state = {
      fileData: null
    }
  }

  componentDidMount () {
    this.props.getData()
  }

  handleChange (e) {
    e.preventDefault()
    let selectedVal = parseInt(e.target.value)
    let idx = parseInt(e.target.getAttribute('data-index'))
    let rArr = this.props.data.filteredList
    let temp = rArr[idx]
    rArr = [...rArr.slice(0, idx), {...temp, OrderNo: selectedVal}, ...rArr.slice(idx + 1)]
    this.props.orderData(rArr)
  }

  render () {
    let counter = 0
    let rootArray = this.props.data ? this.props.data.filteredList : new Map()
    const rows = this.props.isFetch ? rootArray.map((item) =>
      <Row item={item} key={item.ID} counter={counter++} handleChange={::this.handleChange}/>) : <tr>loading...</tr>

    return (
      <div className='abc'>
        <table>
          <thead>
            <tr>
              <th>Stt</th>
              <th>Tên đơn vị</th>
              <th>Mã đơn vị</th>
              <th>Mã đơn vị cấp trên</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(mapStateToProps, manageData)(TreeView)
