import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move'
}

const cardSource = {
  beginDrag (props) {
    return {
      id: props.id,
      index: props.index
    }
  }
}

const cardTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging rightwards, only move when the cursor is below 50%
    // When dragging leftwards, only move when the cursor is above 50%
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return
    }

    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return
    }

    props.moveCard(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  }
}

@DropTarget('CARD', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))

@DragSource('CARD', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export default class Card extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    id: PropTypes.any.isRequired,
    text: PropTypes.string.isRequired,
    moveCard: PropTypes.func.isRequired
  }

  render () {
    const { text, isDragging, connectDragSource, connectDropTarget } = this.props
    const opacity = isDragging ? 0 : 1
    return connectDragSource(connectDropTarget(
      <div style={{...style, opacity}}>
        {text}
      </div>
    ))
  }
}
